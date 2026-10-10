mvn -f shared/parent-pom/pom.xml install -N
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

mvn -f shared/common-library/pom.xml install -DskipTests
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

mvn -f services/auth-service/pom.xml clean package -DskipTests
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

mvn -f services/product-service/pom.xml clean package -DskipTests
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

mvn -f services/payment-service/pom.xml clean package -DskipTests
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

mvn -f services/order-service/pom.xml clean package -DskipTests
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

mvn -f services/cart-service/pom.xml clean package -DskipTests
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "All builds completed successfully!"
