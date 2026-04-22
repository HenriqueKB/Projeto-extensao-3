import customtkinter as ctk
import mysql.connector as sql

# 1. Configuração Inicial do Visual
ctk.set_appearance_mode("light")
ctk.set_default_color_theme("blue")

# Cores baseadas no protótipo CSS
BG_BODY = "#F5F7FA"
BG_CARD = "#FFFFFF"
TEXT_DARK = "#333333"
TEXT_GRAY = "#777777"
PRIMARY = "#4A90E2"
PRIMARY_LIGHT = "#F0F6FF"
SUCCESS = "#2ECC71"
SUCCESS_BG = "#E8F8F5"
WARNING = "#F39C12"
WARNING_BG = "#FEF5E7"

# 2. Criando a Janela Principal
app = ctk.CTk()
app.geometry("1000x650")
app.title("PsicoAgenda - Painel")
app.configure(fg_color=BG_BODY)

# Layout: dividindo em 2 colunas (Menu e Conteúdo)
app.grid_rowconfigure(0, weight=1)
app.grid_columnconfigure(1, weight=1)

# ==========================================
# MENU LATERAL (Sidebar)
# ==========================================
sidebar = ctk.CTkFrame(app, width=250, corner_radius=0, fg_color=BG_CARD)
sidebar.grid(row=0, column=0, sticky="nsew")
sidebar.grid_propagate(False) # Mantém a largura fixa

# Logo
logo = ctk.CTkLabel(sidebar, text="PsicoAgenda", font=ctk.CTkFont(size=24, weight="bold"), text_color=PRIMARY)
logo.pack(pady=(30, 30), padx=20, anchor="w")

# Função para criar itens do menu
def criar_item_menu(texto, ativo=False):
    cor_fundo = PRIMARY_LIGHT if ativo else "transparent"
    cor_texto = PRIMARY if ativo else TEXT_GRAY
    btn = ctk.CTkButton(sidebar, text=texto, fg_color=cor_fundo, text_color=cor_texto, 
                        anchor="w", hover_color=PRIMARY_LIGHT, font=ctk.CTkFont(size=14))
    btn.pack(pady=5, padx=15, fill="x")

criar_item_menu("📅 Agenda do Dia", ativo=True)
criar_item_menu("👥 Pacientes")
criar_item_menu("📝 Prontuários")
criar_item_menu("💰 Financeiro")
criar_item_menu("⚙️ Configurações")


# ==========================================
# CONTEÚDO PRINCIPAL
# ==========================================
main_frame = ctk.CTkFrame(app, fg_color="transparent")
main_frame.grid(row=0, column=1, sticky="nsew", padx=30, pady=20)

# --- CABEÇALHO (Header) ---
header = ctk.CTkFrame(main_frame, fg_color=BG_CARD, corner_radius=8)
header.pack(fill="x", pady=(0, 20), ipadx=20, ipady=15)

header_info = ctk.CTkFrame(header, fg_color="transparent")
header_info.pack(side="left", padx=20)

ctk.CTkLabel(header_info, text="Olá, Dra. Alessandra 👋", font=ctk.CTkFont(size=22, weight="bold"), text_color=TEXT_DARK).pack(anchor="w")
ctk.CTkLabel(header_info, text="Terça-feira, 31 de Março de 2026", font=ctk.CTkFont(size=14), text_color=TEXT_GRAY).pack(anchor="w")

ctk.CTkButton(header, text="+ Novo Agendamento", fg_color=PRIMARY, font=ctk.CTkFont(weight="bold")).pack(side="right", padx=20)


# --- ESTATÍSTICAS (Stats Grid) ---
stats_frame = ctk.CTkFrame(main_frame, fg_color="transparent")
stats_frame.pack(fill="x", pady=(0, 20))
stats_frame.grid_columnconfigure((0, 1, 2), weight=1)

def criar_cartao_estatistica(parent, coluna, titulo, valor, cor_valor=TEXT_DARK):
    card = ctk.CTkFrame(parent, fg_color=BG_CARD, corner_radius=8)
    # Margens para separar os cartões
    pad_esq = 0 if coluna == 0 else 10
    pad_dir = 0 if coluna == 2 else 10
    card.grid(row=0, column=coluna, sticky="nsew", padx=(pad_esq, pad_dir))
    
    ctk.CTkLabel(card, text=titulo, font=ctk.CTkFont(size=14), text_color=TEXT_GRAY).pack(anchor="w", padx=20, pady=(15, 0))
    ctk.CTkLabel(card, text=valor, font=ctk.CTkFont(size=28, weight="bold"), text_color=cor_valor).pack(anchor="w", padx=20, pady=(0, 15))

criar_cartao_estatistica(stats_frame, 0, "Consultas Hoje", "6")
criar_cartao_estatistica(stats_frame, 1, "Confirmadas", "5", SUCCESS)
criar_cartao_estatistica(stats_frame, 2, "Aguardando Confirmação", "1", WARNING)


# --- AGENDA (Schedule Container) ---
schedule = ctk.CTkFrame(main_frame, fg_color=BG_CARD, corner_radius=8)
schedule.pack(fill="both", expand=True)

ctk.CTkLabel(schedule, text="Sua Agenda (Hoje)", font=ctk.CTkFont(size=18, weight="bold"), text_color=TEXT_DARK).pack(anchor="w", padx=20, pady=(20, 10))

# Linha divisória do título
linha_divisoria = ctk.CTkFrame(schedule, height=1, fg_color=BG_BODY)
linha_divisoria.pack(fill="x", padx=20, pady=(0, 10))

# Função para adicionar pacientes na lista
def add_consulta(horario, nome, tipo, status_texto, status_cor, status_bg):
    row = ctk.CTkFrame(schedule, fg_color="transparent")
    row.pack(fill="x", padx=20, pady=10)
  
    # Horário
    ctk.CTkLabel(row, text=horario, font=ctk.CTkFont(size=14, weight="bold"), text_color=TEXT_GRAY, width=60, anchor="w").pack(side="left")
    
    # Informações do Paciente
    info_frame = ctk.CTkFrame(row, fg_color="transparent")
    info_frame.pack(side="left", padx=10)
    
    cor_nome = TEXT_GRAY if nome == "[ Horário Livre ]" else TEXT_DARK
    ctk.CTkLabel(info_frame, text=nome, font=ctk.CTkFont(size=14, weight="bold"), text_color=cor_nome).pack(anchor="w")
    ctk.CTkLabel(info_frame, text=tipo, font=ctk.CTkFont(size=12), text_color=TEXT_GRAY).pack(anchor="w")
    
    # Badge de Status (Pílula colorida)
    status_lbl = ctk.CTkLabel(row, text=status_texto, fg_color=status_bg, text_color=status_cor, 
                              font=ctk.CTkFont(size=12, weight="bold"), corner_radius=15, width=110, height=28)
    status_lbl.pack(side="right")
    
    # Linha sutil separando os pacientes
    separador = ctk.CTkFrame(schedule, height=1, fg_color=PRIMARY_LIGHT)
    separador.pack(fill="x", padx=20)

# Inserindo os dados estáticos
add_consulta("08:00", "Lucas Almeida", "Sessão Online (Zoom)", "Confirmado", SUCCESS, SUCCESS_BG)
add_consulta("09:00", "Juliana Costa", "Sessão Presencial - Sala 2", "Pendente", WARNING, WARNING_BG)
add_consulta("10:00", "[ Horário Livre ]", "Disponível para agendamento", "Livre", TEXT_GRAY, BG_BODY)
add_consulta("11:00", "Roberto Ferreira", "Primeira Consulta - Online", "Confirmado", SUCCESS, SUCCESS_BG)
add_consulta("14:00", "Camila Mendes", "Sessão Presencial - Sala 2", "Confirmado", SUCCESS, SUCCESS_BG)


# 3. Rodar o programa
app.mainloop()