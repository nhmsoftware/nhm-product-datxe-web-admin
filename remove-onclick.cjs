const fs = require('fs');

const files = [
  'src/pages/Vouchers/VoucherList.jsx',
  'src/pages/RiskManagement/AntiFraud.jsx',
  'src/pages/Pricing/Pricing.jsx',
  'src/pages/Operations/ViolationList.jsx',
  'src/pages/Operations/RefundList.jsx',
  'src/pages/Operations/ComplaintList.jsx',
  'src/pages/Marketing/NewsList.jsx',
  'src/pages/Merchants/MerchantList.jsx',
  'src/pages/Marketing/BannerList.jsx',
  'src/pages/Drivers/DriverList.jsx',
  'src/pages/Finance/SubscriptionPackageConfig.jsx',
  'src/pages/Customers/CustomerList.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Standard ones:
    content = content.replace(/<div className="modal-overlay"\s+onClick=\{[^}]+\}>/g, '<div className="modal-overlay">');
    content = content.replace(/<div className="modal-overlay"\s+onClick=\{\(\)\s*=>\s*[^}]+\}>/g, '<div className="modal-overlay">');
    content = content.replace(/<div className="modal-overlay"\s+onClick=\{\(e\)\s*=>\s*e\.target\s*===\s*e\.currentTarget\s*&&\s*[^}]+\}>/g, '<div className="modal-overlay">');
    content = content.replace(/<div className="modal-overlay"\s+onClick=\{\(e\)\s*=>\s*e\.target\s*===\s*e\.currentTarget\s*&&\s*![^&]+&&\s*[^}]+\}>/g, '<div className="modal-overlay">');
    
    // Style ones:
    content = content.replace(/<div className="modal-overlay"\s+onClick=\{handleCloseModal\}\s+style=\{\{\s*([^}]+)\s*\}\}>/g, '<div className="modal-overlay" style={{ $1 }}>');
    content = content.replace(/<div className="modal-overlay"\s+style=\{\{\s*zIndex:\s*1000,\s*background:\s*'rgba\(0,0,0,0\.85\)'\s*\}\}\s+onClick=\{onClose\}>/g, '<div className="modal-overlay" style={{ zIndex: 1000, background: \'rgba(0,0,0,0.85)\' }}>');
    
    // Pricing.jsx specific:
    content = content.replace(/<div className="modal-overlay" onClick=\{\(e\) => \{\s*if \(e\.target\.className === 'modal-overlay'\) setShowSurgeModal\(false\);\s*\}\}>/g, '<div className="modal-overlay">');
    
    fs.writeFileSync(file, content);
  }
});
