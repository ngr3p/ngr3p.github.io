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

    # --- TEMPLATE RICO (LOREM IPSUM + ESTRUTURA) ---
    html_template = """<h2>0x00 - Executive Summary</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. <strong>Impact analysis</strong> suggests critical vulnerability in the core system logic.</p>

<h2>0x01 - Prerequisites & Tooling</h2>
<p>To follow this guide, ensure your lab meets the following requirements:</p>
<ul>
    <li><strong>Attacker Machine:</strong> Kali Linux (Updated) or Commando VM.</li>
    <li><strong>Target Environment:</strong> Windows Server 2019 / Active Directory Forest.</li>
    <li><strong>Tools:</strong>
        <ul>
            <li><a href="#" target="_blank">LoremTool v2.1</a>: Framework standard for network analysis.</li>
            <li><a href="#" target="_blank">IpsumScript</a>: Automation tool for payload delivery.</li>
            <li><a href="#" target="_blank">DolorSploit</a>: The main exploitation engine used in this demo.</li>
        </ul>
    </li>
</ul>

<h2>0x02 - The Theory</h2>
<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>

<h2>0x03 - Step-by-Step Execution</h2>

<h3>Step 1: Initial Reconnaissance</h3>
<p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
<div class="terminal-block">
    <div class="terminal-header">
        <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
        <span class="file-name">kali@ngr3p: ~</span>
    </div>
    <pre><code>sudo lorem-scan -target 192.168.1.100 --verbose</code></pre>
</div>

<h3>Step 2: Exploitation & Payload Delivery</h3>
<p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.</p>

<div class="screenshot-container">
    <div class="terminal-header">
        <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
    </div>
    <img src="assets/images/posts/hero.png" alt="Screenshot placeholder showing exploit execution">
    <figcaption class="post-image figcaption">
        Figure 1.0: Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus.
    </figcaption>
</div>

<div class="terminal-block">
    <div class="terminal-header">
        <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
        <span class="file-name">bash — exploit.py</span>
    </div>
    <pre><code>python3 ipsum_exploit.py --payload reverse_tcp --lhost 10.10.10.5</code></pre>
</div>

<h3>Step 3: Post-Exploitation</h3>
<p>Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>

<h2>0x04 - Proof of Concept (PoC)</h2>
<p>Once the execution is complete, the system returns the following hash dump:</p>

<div class="terminal-block">
    <div class="terminal-header">
        <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
        <span class="file-name">output — result</span>
    </div>
    <pre><code>[+] Exploit completed successfully.
[+] Session 1 opened (10.10.10.5:4444 -> 192.168.1.100:59832)

uid=0(root) gid=0(root) groups=0(root)
DONE.</code></pre>
</div>

<h2>0x05 - Offense informs Defense</h2>
<p>To mitigate these vectors, consider the following hardening steps:</p>
<ul>
    <li><strong>Lorem Configuration:</strong> Ensure <code>disable_root_login</code> is set to true.</li>
    <li><strong>Ipsum Patching:</strong> Apply security update KB-123456 immediately.</li>
    <li><strong>Network Segmentation:</strong> Isolate critical assets using VLANs and firewalls.</li>
</ul>
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