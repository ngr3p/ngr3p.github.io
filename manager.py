import os
import json
import re
import datetime
import subprocess
import sys

# Tenta importar readline para as setas funcionarem no input
try:
    import readline
except ImportError:
    pass

# --- CONFIGURACOES ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTENT_DIR = os.path.join(BASE_DIR, 'content')
ARTICLES_DIR = os.path.join(CONTENT_DIR, 'articles')
JSON_PATH = os.path.join(CONTENT_DIR, 'posts.json')

# --- FUNCOES AUXILIARES ---
def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

def load_posts():
    if not os.path.exists(JSON_PATH):
        return []
    try:
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        print("[!] Error: JSON file is corrupted.")
        return []

def save_posts(posts):
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=4, ensure_ascii=False)
    print("[OK] Database updated.")

def run_build():
    print("\n[>] Starting Build System...")
    subprocess.run(["python", "builder.py"])

# --- ACOES DO MENU ---

def list_posts(posts):
    if not posts:
        print("\n[!] No posts found.")
        return

    # Visual limpo, sem barras pesadas
    print(f"\n{'ID':<4} | {'DATE':<10} | {'CATEGORY':<15} | {'TITLE':<40} | {'SLUG'}")
    print("-" * 90) # Apenas uma linha fina para separar o cabecalho
    
    for p in posts:
        pid = p.get('id', '?')
        date = p.get('date', '')
        cat = p.get('category', '')[:14]
        title = p.get('title', '')[:38]
        slug = p.get('slug', '')
        print(f"{pid:<4} | {date:<10} | {cat:<15} | {title:<40} | {slug}")

def create_post():
    print("\n--- NEW POST ---")
    title = input("Title: ").strip()
    if not title: return

    category = input("Category (ex: #RedTeam): ").strip() or "#General"
    
    slug = slugify(title)
    filename = f"{slug}.html"
    filepath = os.path.join(ARTICLES_DIR, filename)

    # Template do Conteúdo
    html_template = f"""<h2>Introduction</h2>
<p>Write introduction...</p>

<h3>Phase 1: Recon</h3>
<p>Technical details...</p>

<div class="terminal-block">
    <pre><code>command here</code></pre>
</div>
"""
    
    if not os.path.exists(ARTICLES_DIR): os.makedirs(ARTICLES_DIR)

    if os.path.exists(filepath):
        print("[!] File already exists. Using existing file.")
    else:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_template)
        print(f"[OK] Content created: {filename}")

    posts = load_posts()
    new_id = 1
    if posts: new_id = max(p.get('id', 0) for p in posts) + 1

    new_post = {
        "id": new_id,
        "title": title,
        # DATA CORRIGIDA PARA YYYY-MM-DD
        "date": datetime.datetime.now().strftime("%Y-%m-%d"),
        "category": category,
        "image": "assets/images/posts/hero.png",
        "status": "post",
        "content_file": filename,
        "slug": slug,
        "url": f"{slug}/"
    }

    posts.insert(0, new_post)
    save_posts(posts)
    
    if input("\n[?] Run Build now? (y/n): ").lower() == 'y':
        run_build()

def edit_post(posts):
    list_posts(posts)
    try:
        target_id = int(input("\nID to Edit: "))
    except ValueError:
        return

    target = None
    for p in posts:
        if p.get('id') == target_id:
            target = p
            break
    
    if not target:
        print("[!] ID not found.")
        return

    print(f"\n--- EDITING ID {target_id} (Press Enter to keep current) ---")
    
    new_title = input(f"Title [{target['title']}]: ").strip()
    if new_title: target['title'] = new_title

    new_cat = input(f"Category [{target['category']}]: ").strip()
    if new_cat: target['category'] = new_cat

    new_date = input(f"Date [{target['date']}]: ").strip()
    if new_date: target['date'] = new_date

    new_slug = input(f"Slug/Folder [{target['slug']}]: ").strip()
    if new_slug: 
        target['slug'] = new_slug
        target['url'] = f"{new_slug}/"

    save_posts(posts)
    
    if input("\n[?] Run Build to apply changes? (y/n): ").lower() == 'y':
        run_build()

def delete_post(posts):
    list_posts(posts)
    try:
        target_id = int(input("\nID to Delete: "))
    except ValueError:
        return

    new_posts = [p for p in posts if p.get('id') != target_id]
    
    if len(new_posts) == len(posts):
        print("[!] ID not found.")
        return

    post_to_delete = next((p for p in posts if p['id'] == target_id), None)
    
    confirm = input(f"[WARNING] Delete post '{post_to_delete['title']}'? (y/n): ")
    if confirm.lower() == 'y':
        save_posts(new_posts)
        
        if post_to_delete and 'content_file' in post_to_delete:
            file_path = os.path.join(ARTICLES_DIR, post_to_delete['content_file'])
            if os.path.exists(file_path):
                if input(f"[?] Delete file '{post_to_delete['content_file']}' too? (y/n): ").lower() == 'y':
                    os.remove(file_path)
                    print("[OK] File deleted.")
        
        if input("\n[?] Run Build now? (y/n): ").lower() == 'y':
            run_build()

# --- MENU PRINCIPAL ---
def main_menu():
    while True:
        try:
            print("\n=== ngr3p MANAGER V3 ===")
            print("1. List Posts")
            print("2. Create Post")
            print("3. Edit Post (Metadata)")
            print("4. Delete Post")
            print("5. Run Build (Sync Dist)")
            print("[ENTER]. Exit")
            
            choice = input("\n> ").strip()

            if choice == '1':
                list_posts(load_posts())
            elif choice == '2':
                create_post()
            elif choice == '3':
                edit_post(load_posts())
            elif choice == '4':
                delete_post(load_posts())
            elif choice == '5':
                run_build()
            elif choice == '': # Sair com ENTER
                print("Bye.")
                break
            else:
                print("[!] Invalid option.")
                
        except KeyboardInterrupt:
            print("\n[!] Interrupted. Bye.")
            break
        except Exception as e:
            print(f"\n[!] Unexpected Error: {e}")
            input("Press Enter to continue...")

if __name__ == "__main__":
    main_menu()