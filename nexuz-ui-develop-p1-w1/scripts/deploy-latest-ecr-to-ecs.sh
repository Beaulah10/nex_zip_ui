#!/usr/bin/env bash
set -Eeuo pipefail

# Deploys a tagged image from ECR to ECS by creating a new task definition revision.
# Constraints enforced:
# - Uses explicit image tag when provided, otherwise latest tagged image by imagePushedAt
# - Does not use digest/SHA
# - Registers new task definition revision before updating service

usage() {
  cat <<'EOF'
Usage:
  deploy-latest-ecr-to-ecs.sh \
    --region <aws-region> \
    --repo <ecr-repo-name> \
    --cluster <ecs-cluster-name> \
    --service <ecs-service-name> \
    --task-family <task-definition-family> \
    [--image-tag <image-tag>] \
    [--container <container-name>]

Required:
  --region        AWS region
  --repo          ECR repository name
  --cluster       ECS cluster name
  --service       ECS service name
  --task-family   ECS task definition family name

Optional:
  --image-tag    Exact ECR image tag to deploy; default resolves latest tag
  --container     Specific container name to update; default updates first container
EOF
}

log() {
  printf '[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"
}

warn() {
  printf '[%s] WARN: %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"
}

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

trap 'fail "Command failed at line ${LINENO}: ${BASH_COMMAND}"' ERR

AWS_REGION=""
ECR_REPO_NAME=""
ECS_CLUSTER_NAME=""
ECS_SERVICE_NAME=""
TASK_DEFINITION_FAMILY=""
IMAGE_TAG=""
CONTAINER_NAME=""
EXPECTED_ALB_HEALTHCHECK_PATH="/api/health"
AUTO_UPDATE_ALB_HEALTHCHECK="${AUTO_UPDATE_ALB_HEALTHCHECK:-true}"

collect_ecs_diagnostics() {
  log "Collecting ECS diagnostics for cluster=${ECS_CLUSTER_NAME} service=${ECS_SERVICE_NAME}"

  SERVICE_JSON="$(aws ecs describe-services \
    --region "${AWS_REGION}" \
    --cluster "${ECS_CLUSTER_NAME}" \
    --services "${ECS_SERVICE_NAME}" \
    --output json 2>/dev/null || true)"

  if [[ -z "${SERVICE_JSON}" || "${SERVICE_JSON}" == "null" ]]; then
    log "No service diagnostics available"
    return 0
  fi

  log "Recent ECS service events:"
  printf '%s' "${SERVICE_JSON}" | jq -r '.services[0].events[0:10][]? | "- [\(.createdAt)] \(.message)"' || true

  ACTIVE_TASK_DEF="$(printf '%s' "${SERVICE_JSON}" | jq -r '.services[0].taskDefinition // empty')"
  if [[ -n "${ACTIVE_TASK_DEF}" ]]; then
    log "Service currently points to task definition: ${ACTIVE_TASK_DEF}"
  fi

  STOPPED_TASK_ARNS="$(aws ecs list-tasks \
    --region "${AWS_REGION}" \
    --cluster "${ECS_CLUSTER_NAME}" \
    --service-name "${ECS_SERVICE_NAME}" \
    --desired-status STOPPED \
    --max-results 5 \
    --query 'taskArns' \
    --output text 2>/dev/null || true)"

  if [[ -n "${STOPPED_TASK_ARNS}" ]]; then
    log "Recent stopped task reasons:"
    aws ecs describe-tasks \
      --region "${AWS_REGION}" \
      --cluster "${ECS_CLUSTER_NAME}" \
      --tasks ${STOPPED_TASK_ARNS} \
      --output json 2>/dev/null | jq -r '.tasks[]? | "- task=\(.taskArn | split("/") | last) stopCode=\(.stopCode // "N/A") stoppedReason=\(.stoppedReason // "N/A")"' || true

    aws ecs describe-tasks \
      --region "${AWS_REGION}" \
      --cluster "${ECS_CLUSTER_NAME}" \
      --tasks ${STOPPED_TASK_ARNS} \
      --output json 2>/dev/null | jq -r '.tasks[]?.containers[]? | "  container=\(.name) reason=\(.reason // "N/A") exitCode=\((.exitCode // "N/A")|tostring) health=\(.healthStatus // "N/A")"' || true
  else
    log "No stopped tasks found for service"
  fi

  TARGET_GROUP_ARN="$(printf '%s' "${SERVICE_JSON}" | jq -r '.services[0].loadBalancers[0].targetGroupArn // empty')"
  if [[ -n "${TARGET_GROUP_ARN}" ]]; then
    log "ALB target health states:"
    aws elbv2 describe-target-health \
      --region "${AWS_REGION}" \
      --target-group-arn "${TARGET_GROUP_ARN}" \
      --output json 2>/dev/null | jq -r '.TargetHealthDescriptions[]? | "- target=\(.Target.Id):\(.Target.Port) state=\(.TargetHealth.State) reason=\(.TargetHealth.Reason // "N/A") description=\(.TargetHealth.Description // "N/A")"' || true
  fi
}

ensure_target_group_healthcheck_path() {
  if [[ "${AUTO_UPDATE_ALB_HEALTHCHECK}" != "true" ]]; then
    log "Skipping ALB health check path update (AUTO_UPDATE_ALB_HEALTHCHECK=${AUTO_UPDATE_ALB_HEALTHCHECK})"
    return 0
  fi

  local service_json="$1"
  local target_group_arn
  target_group_arn="$(printf '%s' "${service_json}" | jq -r '.services[0].loadBalancers[0].targetGroupArn // empty')"

  if [[ -z "${target_group_arn}" ]]; then
    log "No target group attached to ECS service; skipping ALB health check path validation"
    return 0
  fi

  local current_path
  current_path="$(aws elbv2 describe-target-groups \
    --region "${AWS_REGION}" \
    --target-group-arns "${target_group_arn}" \
    --query 'TargetGroups[0].HealthCheckPath' \
    --output text 2>/dev/null || true)"

  if [[ -z "${current_path}" || "${current_path}" == "None" ]]; then
    log "Unable to read target group health check path for ${target_group_arn}; continuing"
    return 0
  fi

  if [[ "${current_path}" == "${EXPECTED_ALB_HEALTHCHECK_PATH}" ]]; then
    log "ALB health check path already configured as ${EXPECTED_ALB_HEALTHCHECK_PATH}"
    return 0
  fi

  log "Updating ALB target group health check path from ${current_path} to ${EXPECTED_ALB_HEALTHCHECK_PATH}"
  local modify_output
  if ! modify_output="$(aws elbv2 modify-target-group \
    --region "${AWS_REGION}" \
    --target-group-arn "${target_group_arn}" \
    --health-check-path "${EXPECTED_ALB_HEALTHCHECK_PATH}" \
    --matcher HttpCode=200 2>&1)"; then
    if printf '%s' "${modify_output}" | grep -qi 'AccessDenied'; then
      warn "No permission to modify target group health-check path; continuing deployment"
      warn "Grant elasticloadbalancing:ModifyTargetGroup on ${target_group_arn} to enable automatic update"
      warn "Current ALB health check path remains ${current_path}"
      return 0
    fi

    fail "Unable to update ALB health check path for ${target_group_arn}: ${modify_output}"
  fi

  log "ALB health check path updated"
}

upsert_container_env_var() {
  local payload="$1"
  local container_name="$2"
  local env_name="$3"
  local env_value="$4"

  if [[ -z "${env_value}" ]]; then
    printf '%s' "${payload}"
    return 0
  fi

  if [[ -n "${container_name}" ]]; then
    printf '%s' "${payload}" | jq \
      --arg CNAME "${container_name}" \
      --arg ENAME "${env_name}" \
      --arg EVALUE "${env_value}" '
        .containerDefinitions |= map(
          if .name == $CNAME then
            .environment = ((.environment // []) | map(select(.name != $ENAME)) + [{name: $ENAME, value: $EVALUE}])
          else
            .
          end
        )
      '
  else
    printf '%s' "${payload}" | jq \
      --arg ENAME "${env_name}" \
      --arg EVALUE "${env_value}" '
        .containerDefinitions[0].environment = ((.containerDefinitions[0].environment // []) | map(select(.name != $ENAME)) + [{name: $ENAME, value: $EVALUE}])
      '
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --region)
      AWS_REGION="${2:-}"
      shift 2
      ;;
    --repo)
      ECR_REPO_NAME="${2:-}"
      shift 2
      ;;
    --cluster)
      ECS_CLUSTER_NAME="${2:-}"
      shift 2
      ;;
    --service)
      ECS_SERVICE_NAME="${2:-}"
      shift 2
      ;;
    --task-family)
      TASK_DEFINITION_FAMILY="${2:-}"
      shift 2
      ;;
    --image-tag)
      IMAGE_TAG="${2:-}"
      shift 2
      ;;
    --container)
      CONTAINER_NAME="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
done

[[ -n "${AWS_REGION}" ]] || fail "--region is required"
[[ -n "${ECR_REPO_NAME}" ]] || fail "--repo is required"
[[ -n "${ECS_CLUSTER_NAME}" ]] || fail "--cluster is required"
[[ -n "${ECS_SERVICE_NAME}" ]] || fail "--service is required"
[[ -n "${TASK_DEFINITION_FAMILY}" ]] || fail "--task-family is required"

command -v aws >/dev/null 2>&1 || fail "aws CLI is not installed"
command -v jq >/dev/null 2>&1 || fail "jq is not installed"

export AWS_PAGER=""
export AWS_RETRY_MODE="standard"
export AWS_MAX_ATTEMPTS="10"


ACCOUNT_ID="$(aws sts get-caller-identity --region "${AWS_REGION}" --query 'Account' --output text)"
[[ -n "${ACCOUNT_ID}" && "${ACCOUNT_ID}" != "None" ]] || fail "Unable to resolve AWS account id"

if [[ -n "${IMAGE_TAG}" ]]; then
  log "Using explicit ECR tag ${IMAGE_TAG} from workflow input"

  TAG_EXISTS="$(aws ecr describe-images \
    --region "${AWS_REGION}" \
    --repository-name "${ECR_REPO_NAME}" \
    --image-ids imageTag="${IMAGE_TAG}" \
    --query 'length(imageDetails)' \
    --output text 2>/dev/null || true)"

  [[ "${TAG_EXISTS}" != "0" && -n "${TAG_EXISTS}" ]] || fail "Tag ${IMAGE_TAG} does not exist in ECR repo ${ECR_REPO_NAME}"
  SELECTED_TAG="${IMAGE_TAG}"
else
  log "Resolving latest ECR tag from ${ECR_REPO_NAME} in ${AWS_REGION}"
  SELECTED_TAG="$({
    aws ecr describe-images \
      --region "${AWS_REGION}" \
      --repository-name "${ECR_REPO_NAME}" \
      --output json
  } | jq -r '
    .imageDetails
    | map(select(.imageTags != null and (.imageTags | length) > 0))
    | sort_by(.imagePushedAt)
    | last
    | .imageTags[0]
  ')"

  [[ -n "${SELECTED_TAG}" && "${SELECTED_TAG}" != "null" ]] || fail "No tagged images found in ECR repo ${ECR_REPO_NAME}"
fi

NEW_IMAGE_URI="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${SELECTED_TAG}"
log "Tag selected: ${SELECTED_TAG}"
log "New image URI: ${NEW_IMAGE_URI}"

log "Reading current task definition: ${TASK_DEFINITION_FAMILY}"
TASK_DEF_RAW="$(aws ecs describe-task-definition \
  --region "${AWS_REGION}" \
  --task-definition "${TASK_DEFINITION_FAMILY}" \
  --output json)"

if [[ -n "${CONTAINER_NAME}" ]]; then
  NEW_TASK_DEF_PAYLOAD="$(
    printf '%s' "${TASK_DEF_RAW}" | jq --arg IMAGE "${NEW_IMAGE_URI}" --arg CNAME "${CONTAINER_NAME}" '
      .taskDefinition
      | .containerDefinitions = (
          .containerDefinitions
          | map(if .name == $CNAME then .image = $IMAGE else . end)
        )
      | del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)
    '
  )"

  MATCH_COUNT="$(
    printf '%s' "${NEW_TASK_DEF_PAYLOAD}" | jq --arg CNAME "${CONTAINER_NAME}" '[.containerDefinitions[] | select(.name == $CNAME)] | length'
  )"
  [[ "${MATCH_COUNT}" -gt 0 ]] || fail "Container ${CONTAINER_NAME} not found in task definition"
else
  NEW_TASK_DEF_PAYLOAD="$(
    printf '%s' "${TASK_DEF_RAW}" | jq --arg IMAGE "${NEW_IMAGE_URI}" '
      .taskDefinition
      | .containerDefinitions[0].image = $IMAGE
      | del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)
    '
  )"
fi

NEW_TASK_DEF_PAYLOAD="$(upsert_container_env_var "${NEW_TASK_DEF_PAYLOAD}" "${CONTAINER_NAME}" "BACKEND_API_BASE_URL" "${BACKEND_API_BASE_URL:-}")"
NEW_TASK_DEF_PAYLOAD="$(upsert_container_env_var "${NEW_TASK_DEF_PAYLOAD}" "${CONTAINER_NAME}" "LABEL_SOURCE" "${LABEL_SOURCE:-}")"
NEW_TASK_DEF_PAYLOAD="$(upsert_container_env_var "${NEW_TASK_DEF_PAYLOAD}" "${CONTAINER_NAME}" "PRISMIC_REPOSITORY_NAME" "${PRISMIC_REPOSITORY_NAME:-}")"
NEW_TASK_DEF_PAYLOAD="$(upsert_container_env_var "${NEW_TASK_DEF_PAYLOAD}" "${CONTAINER_NAME}" "PRISMIC_ACCESS_TOKEN" "${PRISMIC_ACCESS_TOKEN:-}")"
NEW_TASK_DEF_PAYLOAD="$(upsert_container_env_var "${NEW_TASK_DEF_PAYLOAD}" "${CONTAINER_NAME}" "NEXT_PUBLIC_ARKOSE_PUBLIC_KEY" "${NEXT_PUBLIC_ARKOSE_PUBLIC_KEY:-}")"

if [[ -n "${CONTAINER_NAME}" ]]; then
  HAS_BACKEND_API_BASE_URL="$(printf '%s' "${NEW_TASK_DEF_PAYLOAD}" | jq --arg CNAME "${CONTAINER_NAME}" '[.containerDefinitions[] | select(.name == $CNAME) | .environment[]? | select(.name == "BACKEND_API_BASE_URL")] | length')"
else
  HAS_BACKEND_API_BASE_URL="$(printf '%s' "${NEW_TASK_DEF_PAYLOAD}" | jq '[.containerDefinitions[0].environment[]? | select(.name == "BACKEND_API_BASE_URL")] | length')"
fi

if [[ "${HAS_BACKEND_API_BASE_URL}" -eq 0 ]]; then
  warn "BACKEND_API_BASE_URL is not present in the target container environment. Middleware token bootstrap may redirect to standalone-error."
fi

TMP_PAYLOAD_FILE="$(mktemp)"
printf '%s\n' "${NEW_TASK_DEF_PAYLOAD}" > "${TMP_PAYLOAD_FILE}"

log "Registering new task definition revision"
NEW_TASK_DEF_ARN="$(aws ecs register-task-definition \
  --region "${AWS_REGION}" \
  --cli-input-json "file://${TMP_PAYLOAD_FILE}" \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)"

rm -f "${TMP_PAYLOAD_FILE}"

[[ -n "${NEW_TASK_DEF_ARN}" && "${NEW_TASK_DEF_ARN}" != "None" ]] || fail "Failed to register new task definition revision"
log "Registered: ${NEW_TASK_DEF_ARN}"

log "Updating ECS service ${ECS_SERVICE_NAME} on cluster ${ECS_CLUSTER_NAME}"

SERVICE_CHECK_JSON="$(aws ecs describe-services \
  --region "${AWS_REGION}" \
  --cluster "${ECS_CLUSTER_NAME}" \
  --services "${ECS_SERVICE_NAME}" \
  --output json)"

SERVICE_COUNT="$(printf '%s' "${SERVICE_CHECK_JSON}" | jq -r '.services | length')"
MISSING_COUNT="$(printf '%s' "${SERVICE_CHECK_JSON}" | jq -r '.failures | map(select(.reason == "MISSING")) | length')"

if [[ "${SERVICE_COUNT}" -eq 0 || "${MISSING_COUNT}" -gt 0 ]]; then
  log "ECS service not found in the target cluster."
  log "Requested cluster: ${ECS_CLUSTER_NAME}"
  log "Requested service: ${ECS_SERVICE_NAME}"

  AVAILABLE_SERVICES="$(aws ecs list-services \
    --region "${AWS_REGION}" \
    --cluster "${ECS_CLUSTER_NAME}" \
    --query 'serviceArns[]' \
    --output text 2>/dev/null || true)"

  if [[ -n "${AVAILABLE_SERVICES}" ]]; then
    log "Available services in cluster: ${AVAILABLE_SERVICES}"
  else
    log "No services returned for cluster ${ECS_CLUSTER_NAME} (or cluster may not exist in this account/region)."
  fi

  fail "Service ${ECS_SERVICE_NAME} was not found in cluster ${ECS_CLUSTER_NAME}. Check ecs_cluster / ecs_service variables."
fi

ensure_target_group_healthcheck_path "${SERVICE_CHECK_JSON}"

aws ecs update-service \
  --region "${AWS_REGION}" \
  --cluster "${ECS_CLUSTER_NAME}" \
  --service "${ECS_SERVICE_NAME}" \
  --task-definition "${NEW_TASK_DEF_ARN}" \
  --force-new-deployment \
  >/dev/null

log "Waiting for ECS service stability"
if ! aws ecs wait services-stable \
  --region "${AWS_REGION}" \
  --cluster "${ECS_CLUSTER_NAME}" \
  --services "${ECS_SERVICE_NAME}"; then
  collect_ecs_diagnostics
  fail "ECS service did not stabilize within waiter limit"
fi

log "Deployment completed successfully"
