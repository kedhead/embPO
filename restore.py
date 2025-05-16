# Restore Script for StitchPay
# This script restores the application from a backup

import os
import shutil
import datetime
import argparse

def restore_from_backup(backup_date=None):
    # Define the backup directory
    backup_base = os.path.join("K:", "AI-Projects", "stitchpay", "backups")
    
    # If no date specified, list available backups
    if not backup_date:
        available_backups = os.listdir(backup_base)
        if not available_backups:
            print("No backups found.")
            return
        
        print("Available backups:")
        for i, backup in enumerate(available_backups):
            print(f"{i+1}. {backup}")
        
        selection = input("Enter the number of the backup to restore or 'q' to quit: ")
        if selection.lower() == 'q':
            return
        
        try:
            index = int(selection) - 1
            backup_date = available_backups[index]
        except (ValueError, IndexError):
            print("Invalid selection.")
            return
    
    backup_dir = os.path.join(backup_base, backup_date)
    
    if not os.path.exists(backup_dir):
        print(f"Backup directory {backup_dir} does not exist.")
        return
    
    print(f"Restoring from backup: {backup_date}")
    
    # Get confirmation
    confirmation = input("This will overwrite your current files. Are you sure? (y/n): ")
    if confirmation.lower() != 'y':
        print("Restore cancelled.")
        return
    
    # Define the application directories
    app_dir = os.path.join("K:", "AI-Projects", "stitchpay")
    backend_dir = os.path.join(app_dir, "backend")
    src_dir = os.path.join(app_dir, "src")
    
    # Restore backend files
    backend_backup = os.path.join(backup_dir, "backend")
    if os.path.exists(backend_backup):
        for file in os.listdir(backend_backup):
            if file == "instance":  # Handle the database directory separately
                continue
            source = os.path.join(backend_backup, file)
            destination = os.path.join(backend_dir, file)
            if os.path.isfile(source):
                shutil.copy2(source, destination)
                print(f"Restored {file} to {destination}")
    
    # Restore database
    db_source = os.path.join(backend_backup, "instance", "stitchpay.db")
    db_destination = os.path.join(backend_dir, "instance", "stitchpay.db")
    if os.path.exists(db_source):
        # Make sure the instance directory exists
        os.makedirs(os.path.join(backend_dir, "instance"), exist_ok=True)
        shutil.copy2(db_source, db_destination)
        print(f"Restored database to {db_destination}")
    
    # Restore src files
    src_backup = os.path.join(backup_dir, "src")
    if os.path.exists(src_backup):
        for root, dirs, files in os.walk(src_backup):
            relative_path = os.path.relpath(root, src_backup)
            for file in files:
                source = os.path.join(root, file)
                destination_dir = os.path.join(src_dir, relative_path)
                destination = os.path.join(destination_dir, file)
                
                # Make sure the destination directory exists
                os.makedirs(destination_dir, exist_ok=True)
                
                shutil.copy2(source, destination)
                print(f"Restored {file} to {destination}")
    
    # Restore root files
    for file in os.listdir(backup_dir):
        source = os.path.join(backup_dir, file)
        if os.path.isfile(source) and file not in ["backup_info.txt", "create_backup.py", "restore.py"]:
            destination = os.path.join(app_dir, file)
            shutil.copy2(source, destination)
            print(f"Restored {file} to {destination}")
    
    print("\nRestore completed successfully!")
    print("To run the application:")
    print("1. Start the backend: cd backend && python app.py")
    print("2. Start the frontend: npm run dev")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Restore StitchPay application from backup")
    parser.add_argument("--date", help="Backup date to restore from (e.g., 'May-16-2025')")
    args = parser.parse_args()
    
    restore_from_backup(args.date)
