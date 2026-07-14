# Bootstrap Argo CD

## 1. Install Argo CD
To install Argo CD into your Kubernetes cluster, run the following commands:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

## 2. Apply Namespaces
Ensure the target namespaces exist for our environments:
```bash
kubectl apply -f argocd/bootstrap/namespace.yaml
```

## 3. Access the Argo CD UI
By default, the Argo CD API server is not exposed with an external IP. To access the UI, you can use port forwarding:
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```
Open a browser and navigate to `https://localhost:8080`.

## 4. Get the Initial Admin Password
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```
Login with username `admin` and the password retrieved above.

## 5. Register the Git Repository
If your repository is private, you must apply the repository credentials so Argo CD can read your charts:
```bash
kubectl apply -f argocd/repositories/github-repo-secret.yaml
```

## 6. Deploy the App of Apps
Apply the AppProject and the Root Application to kick off the full GitOps sync:
```bash
kubectl apply -f argocd/projects/ecommerce-project.yaml
kubectl apply -f argocd/app-of-apps/root-application.yaml
```
