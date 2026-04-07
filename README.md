Kurulum
1. Projeyi klonla
2. Environment dosyasını oluştur
3. Frontend bağımlılıklarını kur ve build al
4. Docker ile sistemi ayağa kaldır
   
cd frontend 
npm install 
npm run build 
cd ..
docker compose up -d --build

Uygulama Adresleri

Servis	Adres
Frontend	http://localhost
Backend API	http://localhost:8080
MinIO Console	http://localhost:9001
