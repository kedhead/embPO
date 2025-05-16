# -*- mode: python ; coding: utf-8 -*-
import os
from pathlib import Path

block_cipher = None

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(SPECPATH))

# Define datas to be included
datas = [
    ('templates', 'templates'),
    ('instance', 'instance')
]

a = Analysis(
    ['app.py'],
    pathex=[current_dir],
    binaries=[],
    datas=datas,
    hiddenimports=[
        'flask',
        'flask_sqlalchemy',
        'flask_cors',
        'sqlalchemy',
        'dotenv',
        'email_validator'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='flask_server',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='flask_server',
)
