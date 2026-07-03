const REGEX_MD = /[*_`#>[\]()]/g;
function limpar(texto) {
    return texto.replace(REGEX_MD, '').trim();
}
/** Extrai trechos falantes da narrativa — só o que tem prosa real. */
export function extrairFala(resumo_conciso, narrativa) {
    const trechos = [{ indice: -1, texto: limpar(resumo_conciso) }];
    narrativa.forEach((item, i) => {
        if (item.tipo === 'texto' || item.tipo === 'highlight' || item.tipo === 'pausa' || item.tipo === 'analogia') {
            const t = limpar(item.conteudo);
            if (t)
                trechos.push({ indice: i, texto: t });
        }
    });
    return trechos.filter((t) => t.texto.length > 0);
}
/**
 * Voz do Organismo (bloco 2) — TTS offline via Web Speech API, sem dependência
 * externa. Fala em português, avança item a item, permite pausar/retomar.
 */
export class VozDoOrganismo {
    fila = [];
    posicao = 0;
    estado = 'parado';
    velocidade = 1;
    onMudancaItem;
    onMudancaEstado;
    get suportado() {
        return typeof window !== 'undefined' && 'speechSynthesis' in window;
    }
    iniciar(trechos, velocidade = 1) {
        if (!this.suportado)
            return;
        this.parar();
        this.fila = trechos;
        this.posicao = 0;
        this.velocidade = velocidade;
        this.falarProximo();
    }
    falarProximo() {
        if (this.posicao >= this.fila.length) {
            this.parar();
            return;
        }
        const trecho = this.fila[this.posicao];
        const u = new SpeechSynthesisUtterance(trecho.texto);
        u.lang = 'pt-BR';
        u.rate = this.velocidade;
        u.onstart = () => {
            this.estado = 'falando';
            this.onMudancaEstado?.(this.estado);
            this.onMudancaItem?.(trecho.indice);
        };
        u.onend = () => {
            this.posicao += 1;
            this.falarProximo();
        };
        window.speechSynthesis.speak(u);
    }
    pausar() {
        if (!this.suportado)
            return;
        window.speechSynthesis.pause();
        this.estado = 'pausado';
        this.onMudancaEstado?.(this.estado);
    }
    retomar() {
        if (!this.suportado)
            return;
        window.speechSynthesis.resume();
        this.estado = 'falando';
        this.onMudancaEstado?.(this.estado);
    }
    parar() {
        if (!this.suportado)
            return;
        window.speechSynthesis.cancel();
        this.estado = 'parado';
        this.onMudancaEstado?.(this.estado);
        this.onMudancaItem?.(null);
    }
    get estadoAtual() {
        return this.estado;
    }
}
