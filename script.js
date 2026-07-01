// متغيرات عامة
let allDomains = [];
let currentCategory = 'all';

// تحميل البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadDomains();
});

// جلب البيانات من ملف JSON
async function loadDomains() {
    try {
        const response = await fetch('domains.json');
        if (!response.ok) {
            throw new Error('فشل تحميل البيانات');
        }
        allDomains = await response.json();
        displayDomains(allDomains);
        updateStats(allDomains);
    } catch (error) {
        console.error('خطأ:', error);
        document.getElementById('domainsContainer').innerHTML = `
            <div class="error-message">
                <p>⚠️ عذراً، حدث خطأ في تحميل البيانات. يرجى المحاولة لاحقاً.</p>
            </div>
        `;
    }
}

// عرض النطاقات
function displayDomains(domains) {
    const container = document.getElementById('domainsContainer');
    
    if (domains.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>😕 لا توجد نطاقات تطابق معايير البحث</p>
            </div>
        `;
        return;
    }

    container.innerHTML = domains.map(domain => {
        // تحديد لون الحالة
        let statusClass = 'available';
        let statusText = 'متاح';
        if (domain.status === 'محجوز') {
            statusClass = 'reserved';
            statusText = 'محجوز';
        } else if (domain.status === 'مباع') {
            statusClass = 'sold';
            statusText = 'مباع';
        }

        return `
            <div class="card" data-id="${domain.id}">
                <span class="domain-status ${statusClass}">${statusText}</span>
                <h3 class="domain-name">${domain.name}</h3>
                <p class="domain-price">$${domain.price.toLocaleString()} <span class="currency">دولار</span></p>
                <p class="domain-description">${domain.description}</p>
                <span class="domain-category">${domain.category}</span>
            </div>
        `;
    }).join('');
}

// تحديث الإحصائيات
function updateStats(domains) {
    const total = domains.length;
    const available = domains.filter(d => d.status === 'متاح').length;
    document.getElementById('stats').innerHTML = `
        عرض <strong>${total}</strong> نطاقاً (${available} متاح للبيع)
    `;
}

// تصفية حسب الفئة
function filterByCategory(category) {
    currentCategory = category;
    
    // تحديث الأزرار
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    filterDomains();
}

// تصفية متقدمة (بحث + سعر + فئة)
function filterDomains() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;

    const filtered = allDomains.filter(domain => {
        // تصفية حسب الفئة
        if (currentCategory !== 'all' && domain.category !== currentCategory) {
            return false;
        }

        // تصفية حسب البحث (الاسم + الوصف)
        if (searchTerm) {
            const nameMatch = domain.name.toLowerCase().includes(searchTerm);
            const descMatch = domain.description.toLowerCase().includes(searchTerm);
            if (!nameMatch && !descMatch) {
                return false;
            }
        }

        // تصفية حسب السعر
        const price = domain.price;
        if (price < minPrice || price > maxPrice) {
            return false;
        }

        return true;
    });

    displayDomains(filtered);
    updateStats(filtered);
}
