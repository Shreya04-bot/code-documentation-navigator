import shutil
import os

UPLOAD_DIR = "uploaded_repos"

def save_repo(path: str):
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    return path  # since you already use local paths

def clear_storage():
    if os.path.exists(UPLOAD_DIR):
        shutil.rmtree(UPLOAD_DIR)
