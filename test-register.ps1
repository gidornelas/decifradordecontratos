$headers = @{"Content-Type"="application/json"}
$body = '{"email":"giannydornelas@gmail.com","password":"Gianny1307b@"}'
Invoke-WebRequest -Uri "https://decifradordecontratos.vercel.app/api/auth/login" -Method POST -Headers $headers -Body $body