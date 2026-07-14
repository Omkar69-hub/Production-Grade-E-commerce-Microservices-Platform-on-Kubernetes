variable "environment" { type = string }
variable "oidc_provider_arn" { type = string }
variable "oidc_issuer_url" { type = string }

# AWS Load Balancer Controller IRSA Role
data "aws_iam_policy_document" "aws_lbc_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"
    principals {
      identifiers = [var.oidc_provider_arn]
      type        = "Federated"
    }
    condition {
      test     = "StringEquals"
      variable = "${replace(var.oidc_issuer_url, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
    }
  }
}

resource "aws_iam_role" "aws_lbc" {
  name               = "${var.environment}-aws-load-balancer-controller"
  assume_role_policy = data.aws_iam_policy_document.aws_lbc_assume_role.json
}

# (The actual policy attachment for AWS LBC is highly complex, typically downloaded directly from AWS)
resource "aws_iam_role_policy_attachment" "aws_lbc" {
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess" # Placeholder for ALB policy
  role       = aws_iam_role.aws_lbc.name
}

output "aws_lbc_role_arn" {
  value = aws_iam_role.aws_lbc.arn
}
