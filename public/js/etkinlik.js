// Etkinlik işlemleri için AJAX fonksiyonları

// Etkinliğe katılma
document.addEventListener('DOMContentLoaded', function() {
    // Katıl butonu
    document.getElementById('katilBtn')?.addEventListener('click', async function() {
        const etkinlikId = this.dataset.etkinlikId;
        
        try {
            const response = await fetch(`/etkinlik/${etkinlikId}/katil`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Butonları güncelle
                this.style.display = 'none';
                document.getElementById('ayrilBtn').style.display = 'block';
                
                // Katılımcı sayısını güncelle
                const katilimciSayisiEl = document.querySelector('.katilimci-sayisi');
                if (katilimciSayisiEl) {
                    katilimciSayisiEl.textContent = result.katilimciSayisi;
                }
                
                // Başarı mesajı
                showAlert('Etkinliğe katılım başarılı!', 'success');
            } else {
                showAlert(result.message, 'error');
            }
        } catch (error) {
            console.error('Katılma hatası:', error);
            showAlert('Bir hata oluştu', 'error');
        }
    });
    
    // Ayrıl butonu
    document.getElementById('ayrilBtn')?.addEventListener('click', async function() {
        const etkinlikId = this.dataset.etkinlikId;
        
        try {
            const response = await fetch(`/etkinlik/${etkinlikId}/ayril`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Butonları güncelle
                this.style.display = 'none';
                document.getElementById('katilBtn').style.display = 'block';
                
                // Katılımcı sayısını güncelle
                const katilimciSayisiEl = document.querySelector('.katilimci-sayisi');
                if (katilimciSayisiEl) {
                    katilimciSayisiEl.textContent = result.katilimciSayisi;
                }
                
                // Başarı mesajı
                showAlert('Etkinlikten ayrılma başarılı!', 'success');
            } else {
                showAlert(result.message, 'error');
            }
        } catch (error) {
            console.error('Ayrılma hatası:', error);
            showAlert('Bir hata oluştu', 'error');
        }
    });
    
    // Beğen butonu
    document.getElementById('begenBtn')?.addEventListener('click', async function() {
        const etkinlikId = this.dataset.etkinlikId;
        
        try {
            const response = await fetch(`/etkinlik/${etkinlikId}/begen`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Butonları güncelle
                this.style.display = 'none';
                document.getElementById('begeniKaldirBtn').style.display = 'block';
                
                // Beğeni sayısını güncelle
                document.getElementById('begeniSayisi').textContent = result.begeniSayisi;
                
                // Başarı mesajı
                showAlert('Etkinlik beğenildi!', 'success');
            } else {
                showAlert(result.message, 'error');
            }
        } catch (error) {
            console.error('Beğenme hatası:', error);
            showAlert('Bir hata oluştu', 'error');
        }
    });
    
    // Beğeni kaldır butonu
    document.getElementById('begeniKaldirBtn')?.addEventListener('click', async function() {
        const etkinlikId = this.dataset.etkinlikId;
        
        try {
            const response = await fetch(`/etkinlik/${etkinlikId}/begeni-kaldir`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Butonları güncelle
                this.style.display = 'none';
                document.getElementById('begenBtn').style.display = 'block';
                
                // Beğeni sayısını güncelle
                document.getElementById('begeniSayisi').textContent = result.begeniSayisi;
                
                // Başarı mesajı
                showAlert('Beğeni kaldırıldı!', 'success');
            } else {
                showAlert(result.message, 'error');
            }
        } catch (error) {
            console.error('Beğeni kaldırma hatası:', error);
            showAlert('Bir hata oluştu', 'error');
        }
    });
    
    // Favori ekle butonu
    document.getElementById('favoriEkleBtn')?.addEventListener('click', async function() {
        const etkinlikId = this.dataset.etkinlikId;
        
        try {
            const response = await fetch(`/etkinlik/${etkinlikId}/favori-ekle`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Butonları güncelle
                this.style.display = 'none';
                document.getElementById('favoriCikarBtn').style.display = 'block';
                
                // Başarı mesajı
                showAlert('Etkinlik favorilere eklendi!', 'success');
            } else {
                showAlert(result.message, 'error');
            }
        } catch (error) {
            console.error('Favori ekleme hatası:', error);
            showAlert('Bir hata oluştu', 'error');
        }
    });
    
    // Favori çıkar butonu
    document.getElementById('favoriCikarBtn')?.addEventListener('click', async function() {
        const etkinlikId = this.dataset.etkinlikId;
        
        try {
            const response = await fetch(`/etkinlik/${etkinlikId}/favori-cikar`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Butonları güncelle
                this.style.display = 'none';
                document.getElementById('favoriEkleBtn').style.display = 'block';
                
                // Başarı mesajı
                showAlert('Etkinlik favorilerden çıkarıldı!', 'success');
            } else {
                showAlert(result.message, 'error');
            }
        } catch (error) {
            console.error('Favori çıkarma hatası:', error);
            showAlert('Bir hata oluştu', 'error');
        }
    });
});

// Alert mesajı gösterme
function showAlert(message, type) {
    // Bootstrap alert oluştur
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 3 saniye sonra otomatik kapat
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 3000);
}