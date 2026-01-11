import os
import requests
from tqdm import tqdm # Progress bar

# 1. Define where EasyOCR expects the models
user_home = os.path.expanduser("~")
model_dir = os.path.join(user_home, ".EasyOCR", "model")

# 2. Define the exact files needed
files = {
    "craft_mlt_25k.pth": "https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/craft_mlt_25k.pth",
    "english_g2.pth": "https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/english_g2.pth"
}

def download_file(url, filename):
    filepath = os.path.join(model_dir, filename)
    
    if os.path.exists(filepath):
        print(f"✅ Found {filename}, skipping download.")
        return

    print(f"⬇️ Downloading {filename}...")
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status() # Check for errors
        
        total_size = int(response.headers.get('content-length', 0))
        block_size = 1024 # 1KB
        
        with open(filepath, "wb") as file, tqdm(
            desc=filename,
            total=total_size,
            unit='iB',
            unit_scale=True,
            unit_divisor=1024,
        ) as bar:
            for data in response.iter_content(block_size):
                bar.update(len(data))
                file.write(data)
                
        print(f"✅ Successfully downloaded {filename}")
        
    except Exception as e:
        print(f"❌ Failed to download {filename}: {e}")

if __name__ == "__main__":
    # Create directory if it doesn't exist
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        print(f"📂 Created folder: {model_dir}")
    
    # Needs 'requests' and 'tqdm'
    try:
        import requests
        from tqdm import tqdm
    except ImportError:
        print("Installing downloader libraries...")
        os.system("pip install requests tqdm")
        import requests
        from tqdm import tqdm

    print("🚀 Starting Manual Model Download...")
    for name, url in files.items():
        download_file(url, name)
    
    print("\n🎉 All Done! You can now run the server.")