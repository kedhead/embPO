# Backup Script for StitchPay
# Created on May 16, 2025

import os
import shutil
import datetime

# Define the backup directory
backup_base = os.path.join("K:", "AI-Projects", "stitchpay", "backups")
backup_dir = os.path.join(backup_base, "May-16-2025")

# Create the backup directory if it doesn't exist
os.makedirs(backup_dir, exist_ok=True)
print(f"Created backup directory at {backup_dir}")

# Create subdirectories for backend and frontend
backend_backup = os.path.join(backup_dir, "backend")
os.makedirs(backend_backup, exist_ok=True)

src_backup = os.path.join(backup_dir, "src")
os.makedirs(src_backup, exist_ok=True)
os.makedirs(os.path.join(src_backup, "contexts"), exist_ok=True)
os.makedirs(os.path.join(src_backup, "pages"), exist_ok=True)
os.makedirs(os.path.join(src_backup, "types"), exist_ok=True)
os.makedirs(os.path.join(src_backup, "utils"), exist_ok=True)

# Files to backup from backend
backend_files = [
    "app.py",
    "models.py",
    "routes.py",
    "extensions.py",
    "fix_schema.py"
]

# Files to backup from src
src_files = {
    "contexts": ["PurchaseOrderContext.tsx", "SettingsContext.tsx"],
    "pages": ["Dashboard.tsx", "PurchaseOrderDetails.tsx", "CreatePurchaseOrder.tsx", "PurchaseOrderList.tsx"],
    "types": ["index.ts"],
    "utils": ["printSettings.ts"]
}

# Backup root files
root_files = [
    "vite.config.ts",
    "tsconfig.json",
    "package.json"
]

# Copy backend files
for file in backend_files:
    source = os.path.join("K:", "AI-Projects", "stitchpay", "backend", file)
    destination = os.path.join(backend_backup, file)
    if os.path.exists(source):
        shutil.copy2(source, destination)
        print(f"Backed up {source} to {destination}")
    else:
        print(f"Warning: Source file {source} does not exist")

# Copy src files
for folder, files in src_files.items():
    for file in files:
        source = os.path.join("K:", "AI-Projects", "stitchpay", "src", folder, file)
        destination = os.path.join(src_backup, folder, file)
        if os.path.exists(source):
            shutil.copy2(source, destination)
            print(f"Backed up {source} to {destination}")
        else:
            print(f"Warning: Source file {source} does not exist")

# Copy root files
for file in root_files:
    source = os.path.join("K:", "AI-Projects", "stitchpay", file)
    destination = os.path.join(backup_dir, file)
    if os.path.exists(source):
        shutil.copy2(source, destination)
        print(f"Backed up {source} to {destination}")
    else:
        print(f"Warning: Source file {source} does not exist")

# Backup the database
db_source = os.path.join("K:", "AI-Projects", "stitchpay", "backend", "instance", "stitchpay.db")
instance_dir = os.path.join(backend_backup, "instance")
os.makedirs(instance_dir, exist_ok=True)
db_destination = os.path.join(instance_dir, "stitchpay.db")

if os.path.exists(db_source):
    shutil.copy2(db_source, db_destination)
    print(f"Backed up database from {db_source} to {db_destination}")
else:
    print(f"Warning: Database file {db_source} does not exist")

# Create a backup info file
info_file = os.path.join(backup_dir, "backup_info.txt")
with open(info_file, "w") as f:
    f.write(f"StitchPay Application Backup\n")
    f.write(f"Created on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    f.write("This backup includes the following components:\n")
    f.write("1. Backend Python files\n")
    f.write("2. Frontend React/TypeScript files\n")
    f.write("3. Database file\n")
    f.write("4. Configuration files\n\n")
    f.write("Status: Working application with fixed issues:\n")
    f.write("- Purchase order creation works correctly\n")
    f.write("- Status editing functionality works\n")
    f.write("- Dashboard displays correctly\n")
    f.write("- Database schema includes due_date column\n")

print(f"Created backup info file at {info_file}")
print("Backup completed successfully!")
