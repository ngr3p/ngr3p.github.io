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

# --- FUNCOES DO SISTEMA ---

def create_post():
    print("\n--- NEW POST ---")
    title = input("Title: ").strip()
    if not title: return

    category = input("Category (ex: #RedTeam): ").strip() or "#General"
    short_desc = input("Short Desc (Card): ").strip()
    description = input("Hero Description: ").strip()

    slug = slugify(title)
    filename = f"{slug}.html"
    filepath = os.path.join(ARTICLES_DIR, filename)

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
        "date": datetime.datetime.now().strftime("%Y-%m-%d"),
        "category": category,
        "description": description,
        "short_desc": short_desc,
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

def manage_posts():
    posts = load_posts()
    if not posts:
        print("\n[!] No posts found.")
        return

    # 1. LISTAGEM COMPACTA (Somente ID e Titulo)
    print("\n" + "="*60)
    print(f"{'ID':<4} | {'DATE':<12} | {'TITLE'}")
    print("-" * 60)
    
    for p in posts:
        pid = str(p.get('id', '?')).zfill(2)
        print(f"{pid:<4} | {p.get('date', ''):<12} | {p.get('title', '')}")
    print("="*60)

    # 2. SELECAO DO ID
    try:
        target_input = input("\nSelect ID (or Enter to cancel): ").strip()
        if not target_input: return
        target_id = int(target_input)
    except ValueError:
        print("[!] Invalid ID.")
        return

    target = None
    for p in posts:
        if p.get('id') == target_id:
            target = p
            break
    
    if not target:
        print("[!] ID not found.")
        return

    # 3. SELECAO DA ACAO (EDITAR OU DELETAR)
    print(f"\n[Selected]: {target['title']}")
    action = input("Action? (e)dit / (d)elete / (c)ancel: ").lower().strip()

    if action == 'e':
        # --- LOGICA DE EDICAO ---
        print(f"\n--- EDITING ID {target_id} ---")
        print("(Press Enter to keep current value)")
        
        target['title'] = input(f"Title [{target['title']}]: ").strip() or target['title']
        target['category'] = input(f"Category [{target['category']}]: ").strip() or target['category']
        target['short_desc'] = input(f"Short Desc [{target['short_desc']}]: ").strip() or target['short_desc']
        target['description'] = input(f"Hero Desc [{target['description']}]: ").strip() or target['description']
        target['date'] = input(f"Date [{target['date']}]: ").strip() or target['date']
        
        new_slug = input(f"Slug [{target['slug']}]: ").strip()
        if new_slug:
            target['slug'] = new_slug
            target['url'] = f"{new_slug}/"

        save_posts(posts)
        if input("\n[?] Run Build now? (y/n): ").lower() == 'y':
            run_build()

    elif action == 'd':
        # --- LOGICA DE DELECAO ---
        confirm = input(f"[WARNING] Delete '{target['title']}'? (y/n): ")
        if confirm.lower() == 'y':
            new_posts = [p for p in posts if p.get('id') != target_id]
            save_posts(new_posts)
            
            # Deletar arquivo fisico
            if 'content_file' in target:
                file_path = os.path.join(ARTICLES_DIR, target['content_file'])
                if os.path.exists(file_path):
                    if input(f"[?] Delete file '{target['content_file']}' too? (y/n): ").lower() == 'y':
                        os.remove(file_path)
                        print("[OK] File deleted.")
            
            if input("\n[?] Run Build now? (y/n): ").lower() == 'y':
                run_build()
    
    else:
        print("[!] Action cancelled.")

# --- MENU PRINCIPAL ---
def main_menu():
    while True:
        try:
            print("\n=== ngr3p MANAGER V6 ===")
            print("1. Create New Post")
            print("2. Manage Existing Posts (Edit/Delete)")
            print("3. Run Build (Sync Dist)")
            print("[ENTER]. Exit")
            
            choice = input("\n> ").strip()

            if choice == '1':
                create_post()
            elif choice == '2':
                manage_posts()
            elif choice == '3':
                run_build()
            elif choice == '': 
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