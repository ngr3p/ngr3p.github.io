import json
import os
import sys
import subprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'assets', 'data', 'posts.json')

def is_root():
    return os.geteuid() == 0

def ensure_db_exists():
    dir_path = os.path.dirname(DB_PATH)
    if not os.path.exists(dir_path):
        if is_root():
            os.makedirs(dir_path, exist_ok=True)
        else:
            subprocess.run(['sudo', 'mkdir', '-p', dir_path], check=True)
            subprocess.run(['sudo', 'chmod', '777', dir_path], check=True)

    if not os.path.exists(DB_PATH):
        if is_root():
            with open(DB_PATH, 'w', encoding='utf-8') as f:
                json.dump([], f)
        else:
            subprocess.run(['sudo', 'sh', '-c', f'echo "[]" > {DB_PATH}'], check=True)
            subprocess.run(['sudo', 'chmod', '666', DB_PATH], check=True)

def load_posts():
    ensure_db_exists()
    try:
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except PermissionError:
        result = subprocess.run(['sudo', 'cat', DB_PATH], capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except Exception:
        return []

def save_posts(posts):
    data = json.dumps(posts, indent=2, ensure_ascii=False)
    try:
        with open(DB_PATH, 'w', encoding='utf-8') as f:
            f.write(data)
        print("\n[+] System: posts.json atualizado!")
    except PermissionError:
        process = subprocess.Popen(['sudo', 'tee', DB_PATH], stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, text=True)
        process.communicate(input=data)
        print("\n[+] System: posts.json atualizado via sudo!")

def list_posts(posts):
    if not posts:
        print("\n[-] Nenhum registro.")
        return
    print("\n" + "="*60)
    print(f"{'ID':<4} | {'CATEGORIA':<15} | {'TÍTULO'}")
    print("-"*60)
    for p in posts:
        print(f"{p.get('id', '?'):<4} | {p.get('category', 'N/A'):<15} | {p.get('title', 'Sem Título')}")
    print("="*60)

def add_post(posts):
    print("\n--- NOVO RESEARCH (Ctrl+C para cancelar) ---")
    new_id = max([p['id'] for p in posts]) + 1 if posts else 1
    new_post = {
        "id": new_id,
        "title": input("Título: ") or "Sem Título",
        "category": input("Categoria: ") or "General",
        "description": input("Descrição: "),
        "short_desc": input("Resumo: "),
        "url": input("URL: ") or "#",
        "date": input("Data (YYYY-MM-DD): ")
    }
    posts.insert(0, new_post)
    save_posts(posts)

def edit_post(posts):
    list_posts(posts)
    try:
        target_id_raw = input("\nID para EDITAR (Ctrl+C para voltar): ")
        if not target_id_raw: return
        target_id = int(target_id_raw)
        
        for p in posts:
            if p['id'] == target_id:
                p['title'] = input(f"Título [{p['title']}]: ") or p['title']
                p['category'] = input(f"Categoria [{p['category']}]: ") or p['category']
                p['description'] = input(f"Descrição [{p['description']}]: ") or p['description']
                p['short_desc'] = input(f"Resumo [{p['short_desc']}]: ") or p['short_desc']
                p['url'] = input(f"URL [{p['url']}]: ") or p['url']
                p['date'] = input(f"Data [{p['date']}]: ") or p['date']
                save_posts(posts)
                return
        print("[-] ID não encontrado.")
    except ValueError:
        print("[-] Erro: ID deve ser um número.")

def delete_post(posts):
    list_posts(posts)
    try:
        target_id_raw = input("\nID para DELETAR (Ctrl+C para voltar): ")
        if not target_id_raw: return
        target_id = int(target_id_raw)
        
        new_posts = [p for p in posts if p['id'] != target_id]
        if len(new_posts) < len(posts):
            if input(f"Confirmar {target_id}? (s/n): ").lower() == 's':
                save_posts(new_posts)
                return new_posts
    except ValueError:
        print("[-] Erro.")
    return posts

def main():
    while True:
        try:
            posts = load_posts()
            print("\nngr3p // MANAGER")
            print("1. Listar | 2. Adicionar | 3. Editar | 4. Deletar | 5. Sair")
            choice = input("\n> ").strip()
            
            if choice in ['', '5']: 
                print("\nSaindo...")
                break
            elif choice == '1': list_posts(posts)
            elif choice == '2': add_post(posts)
            elif choice == '3': edit_post(posts)
            elif choice == '4': posts = delete_post(posts)
            else: print("[-] Comando inválido.")
            
        except KeyboardInterrupt:
            print("\n\n[!] Ação abortada. Retornando ao menu principal...")
            continue # Reinicia o loop, voltando ao menu

if __name__ == "__main__":
    main()