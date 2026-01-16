import json
import os
import sys

# Tenta importar readline para permitir uso de setas (navigation keys) no input
# Isso corrige o problema do ^[[D ao tentar editar texto
try:
    import readline
except ImportError:
    pass # Em Windows ou ambientes sem readline, segue sem o suporte avançado

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# O script espera que o arquivo esteja em manager.py -> assets -> data -> posts.json
DB_PATH = os.path.join(BASE_DIR, 'assets', 'data', 'posts.json')

def ensure_db_exists():
    dir_path = os.path.dirname(DB_PATH)
    # Cria diretório se não existir (modo usuário comum)
    if not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)

    # Cria arquivo vazio se não existir
    if not os.path.exists(DB_PATH):
        with open(DB_PATH, 'w', encoding='utf-8') as f:
            json.dump([], f)

def load_posts():
    ensure_db_exists()
    try:
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"\n[!] ERRO DE SINTAXE NO JSON: {e}")
        print(f"[!] Verifique o arquivo em: {DB_PATH}")
        return []
    except Exception as e:
        print(f"\n[!] ERRO AO LER O ARQUIVO: {e}")
        return []

def save_posts(posts):
    data = json.dumps(posts, indent=2, ensure_ascii=False)
    try:
        with open(DB_PATH, 'w', encoding='utf-8') as f:
            f.write(data)
        print("\n[+] System: posts.json atualizado!")
    except Exception as e:
        print(f"\n[!] Erro ao salvar o arquivo: {e}")

def list_posts(posts):
    if not posts:
        print("\n[-] Nenhum registro encontrado.")
        print(f"[-] O script está lendo de: {DB_PATH}")
        return
    
    header = (
        f"\n{'ID':<4} | {'STATUS':<6} | {'DATA':<10} | {'CATEGORIA':<12} | "
        f"{'TÍTULO':<20} | {'URL':<20} | {'RESUMO':<20} | {'DESCRIÇÃO'}"
    )
    print(header)

    for p in posts:
        pid = p.get('id', 0)
        
        status_val = p.get('status', 'post')
        is_hero = (status_val == 'hero')
        
        date = p.get('date', '')
        cat = p.get('category', '')[:12]
        title = p.get('title', '')[:20]
        url = p.get('url', '')[:20]
        short = p.get('short_desc', '')[:20]
        
        if is_hero:
            desc = p.get('description', '')[:50] + "..." 
            status_display = "HERO"
        else:
            desc = "" 
            status_display = "POST"

        print(
            f"{pid:<4} | {status_display:<6} | {date:<10} | {cat:<12} | "
            f"{title:<20} | {url:<20} | {short:<20} | {desc}"
        )

def add_post(posts):
    print("\n--- NOVO RESEARCH (Ctrl+C para cancelar) ---")
    
    # Se a lista estiver vazia, o ID começa em 1
    if posts:
        new_id = max([p['id'] for p in posts]) + 1 
    else:
        new_id = 1

    # Garante que os posts antigos virem 'post'
    for p in posts:
        p['status'] = 'post'

    new_post = {
        "id": new_id,
        "title": input("Título: ") or "Sem Título",
        "category": input("Categoria: ") or "General",
        "description": input("Descrição: "),
        "short_desc": input("Resumo: "),
        "url": input("URL: ") or "#",
        "date": input("Data (YYYY-MM-DD): "),
        "status": "hero" 
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
                # Com readline importado, as setas funcionarão aqui
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
            print("1. Listar")
            print("2. Adicionar")
            print("3. Editar")
            print("4. Deletar")
            print("5. Sair (ENTER)")
            
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
            continue 

if __name__ == "__main__":
    main()