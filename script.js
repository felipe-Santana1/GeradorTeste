let qrcode = null;
const valorInput = document.getElementById('valor');
const descricaoInput = document.getElementById('descricao');
const pixCodeTextarea = document.getElementById('pix-code');
const copiarBtn = document.getElementById('copiar-btn');
const feedbackCopiar = document.getElementById('copiar-feedback');
const pixCodeContainer = document.getElementById('pix-code-container');

// Elementos da modal de configuração
const configBtn = document.getElementById('config-button');
const modal = document.getElementById('config-modal');
const salvarBtn = document.getElementById('salvar-config');
const cancelarBtn = document.getElementById('cancelar-config');
const modalSenha = document.getElementById('modal-senha');
const configFields = document.getElementById('config-fields');
const modalChave = document.getElementById('modal-chave');
const modalNome = document.getElementById('modal-nome');
const modalCidade = document.getElementById('modal-cidade');

// Elementos da modal de relatório
const relatorioBtn = document.getElementById('relatorio-button');
const relatorioModal = document.getElementById('relatorio-modal');
const relatorioSenha = document.getElementById('relatorio-senha');
const relatorioContent = document.getElementById('relatorio-content');
const fecharRelatorioBtn = document.getElementById('fechar-relatorio');
const tabBtns = document.querySelectorAll('.tab-btn');
const limparHistoricoBtn = document.getElementById('limpar-historico');

// Dados do recebedor PIX (carregados do localStorage ou valores padrão)
let CHAVE_PIX = localStorage.getItem('pixChave');
let NOME_RECEBEDOR = localStorage.getItem('pixNome');
let CIDADE_RECEBEDOR = localStorage.getItem('pixCidade');

// Se não existir no localStorage, define os valores padrão e salva
if (!CHAVE_PIX || !NOME_RECEBEDOR || !CIDADE_RECEBEDOR) {
    CHAVE_PIX = '+5511975086754';
    NOME_RECEBEDOR = 'Rafaela Rocha dos Santos';
    CIDADE_RECEBEDOR = 'SAO PAULO';
    
    // Salva no localStorage
    localStorage.setItem('pixChave', CHAVE_PIX);
    localStorage.setItem('pixNome', NOME_RECEBEDOR);
    localStorage.setItem('pixCidade', CIDADE_RECEBEDOR);
}

// ==================== MODAL DE CONFIGURAÇÃO ====================

if (configBtn) {
    configBtn.onclick = function() {
        modalSenha.value = '';
        configFields.style.display = 'none';
        document.getElementById('senha-error').textContent = '';
        modal.style.display = 'block';
    }
}

if (modalSenha) {
    modalSenha.addEventListener('input', function() {
        const senhaError = document.getElementById('senha-error');
        
        if (this.value === 'TPDM') {
            configFields.style.display = 'block';
            senhaError.textContent = '';
            modalChave.value = CHAVE_PIX;
            modalNome.value = NOME_RECEBEDOR;
            modalCidade.value = CIDADE_RECEBEDOR;
        } else if (this.value.length >= 4) {
            senhaError.textContent = 'Senha incorreta!';
            configFields.style.display = 'none';
        }
    });
}

if (cancelarBtn) {
    cancelarBtn.onclick = function() {
        modal.style.display = 'none';
    }
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
    if (event.target == relatorioModal) {
        relatorioModal.style.display = 'none';
    }
}

if (salvarBtn) {
    salvarBtn.onclick = function() {
        let novaChave = modalChave.value.trim();
        const novoNome = modalNome.value.trim();
        const novaCidade = modalCidade.value.trim();
        
        const chaveError = document.getElementById('chave-error');
        const nomeError = document.getElementById('nome-error');
        
        chaveError.textContent = '';
        nomeError.textContent = '';
        
        if (!novaChave) {
            chaveError.textContent = 'Digite a chave PIX';
            return;
        }
        
        if (!novoNome) {
            nomeError.textContent = 'Digite o nome do recebedor';
            return;
        }
        
        if (!novaCidade) {
            alert('Por favor, preencha a cidade!');
            return;
        }
        
        const chaveAntiga = CHAVE_PIX;
        novaChave = formatarChavePix(novaChave);
        
        if (chaveAntiga !== novaChave) {
            registrarAlteracaoConta(chaveAntiga, novaChave);
        }
        
        // Salvar com trim e formatação
        localStorage.setItem('pixChave', novaChave);
        localStorage.setItem('pixNome', novoNome.substring(0, 25));
        localStorage.setItem('pixCidade', novaCidade.toUpperCase().substring(0, 15));
        
        CHAVE_PIX = novaChave;
        NOME_RECEBEDOR = novoNome.substring(0, 25);
        CIDADE_RECEBEDOR = novaCidade.toUpperCase().substring(0, 15);
        
        modal.style.display = 'none';
        alert('Configurações salvas com sucesso!\nChave formatada: ' + novaChave);
        
        if (valorInput.value || descricaoInput.value) {
            generateQRCode();
        }
    }
}

// ==================== FUNÇÕES PIX ====================

function crc16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function gerarPayloadPix(valor, descricao) {
    function criarCampo(id, conteudo) {
        const tamanho = conteudo.length.toString().padStart(2, '0');
        return `${id}${tamanho}${conteudo}`;
    }
    
    // Merchant Account Information (Tag 26) - só chave PIX
    let merchantAccount = '';
    merchantAccount += criarCampo('00', 'br.gov.bcb.pix');
    merchantAccount += criarCampo('01', CHAVE_PIX);
    
    let payload = '';
    payload += criarCampo('00', '01'); // Payload Format Indicator
    payload += criarCampo('26', merchantAccount); // Merchant Account
    payload += criarCampo('52', '0000'); // Merchant Category Code
    payload += criarCampo('53', '986'); // Transaction Currency (986 = BRL)
    
    // Valor da transação (se houver)
    if (valor && valor !== 'R$ 0,00' && valor !== 'R$ ' && valor !== '') {
        const valorLimpo = valor.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
        const valorFloat = parseFloat(valorLimpo);
        if (!isNaN(valorFloat) && valorFloat > 0) {
            const valorFormatado = valorFloat.toFixed(2);
            payload += criarCampo('54', valorFormatado);
        }
    }
    
    payload += criarCampo('58', 'BR'); // Country Code
    
    // Nome limitado a 25 caracteres
    const nomeFormatado = NOME_RECEBEDOR.trim().substring(0, 25);
    payload += criarCampo('59', nomeFormatado);
    
    // Cidade limitada a 15 caracteres
    const cidadeFormatada = CIDADE_RECEBEDOR.trim().toUpperCase().substring(0, 15);
    payload += criarCampo('60', cidadeFormatada);
    
    // Additional Data Field (Tag 62) - Descrição aqui
    if (descricao && descricao.trim().length > 0) {
        const descLimpa = descricao.trim().substring(0, 26);
        let additionalData = criarCampo('05', descLimpa);
        payload += criarCampo('62', additionalData);
    }
    
    payload += '6304'; // CRC16 placeholder
    
    const crcValue = crc16(payload);
    payload += crcValue;
    
    return payload;
}

function formatarChavePix(chave) {
    // Se for chave aleatória (UUID), retorna sem formatação
    if (chave.includes('-') && chave.length === 36) {
        return chave.toLowerCase();
    }
    
    const limpa = chave.replace(/\D/g, '');
    
    // Telefone com 11 dígitos
    if (limpa.length === 11) {
        return '+55' + limpa;
    }
    
    // Telefone que já começa com 55
    if (limpa.length === 13 && chave.startsWith('55')) {
        return '+' + limpa;
    }
    
    // CPF (11 dígitos) ou CNPJ (14 dígitos)
    if (limpa.length === 11 || limpa.length === 14) {
        return limpa;
    }
    
    // Email
    if (chave.includes('@')) {
        return chave.toLowerCase();
    }
    
    return chave;
}

function formatarMoeda(valor) {
    valor = valor.replace(/\D/g, '');
    
    if (valor === '') return '';
    
    valor = (parseInt(valor) / 100).toFixed(2);
    valor = valor.replace('.', ',');
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return 'R$ ' + valor;
}

// ==================== VALIDAÇÃO E GERAÇÃO ====================

if (valorInput) {
    valorInput.addEventListener('input', function(e) {
        let valor = e.target.value;
        e.target.value = formatarMoeda(valor);
        generateQRCode();
    });
}

if (descricaoInput) {
    descricaoInput.addEventListener('input', function(e) {
        // Remove espaços automaticamente
        e.target.value = e.target.value.replace(/\s/g, '');
        generateQRCode();
    });
}

function validateFields() {
    let isValid = true;
    const valorError = document.getElementById('valor-error');
    const descricaoError = document.getElementById('descricao-error');
    
    valorError.textContent = '';
    descricaoError.textContent = '';
    valorInput.classList.remove('error');
    descricaoInput.classList.remove('error');
    
    const valor = valorInput.value.trim();
    const valorLimpo = valor.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    const valorFloat = parseFloat(valorLimpo);
    
    if (!valor || valor === 'R$ 0,00' || valor === 'R$ ' || isNaN(valorFloat) || valorFloat <= 0) {
        valorError.textContent = 'Por favor, digite um valor válido';
        valorInput.classList.add('error');
        isValid = false;
    }
    
    const descricao = descricaoInput.value.trim();
    if (!descricao || descricao.length === 0) {
        descricaoError.textContent = 'Por favor, digite uma descrição';
        descricaoInput.classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

function generateQRCode() {
    if (!validateFields()) {
        document.getElementById('qrcode').innerHTML = '';
        pixCodeContainer.style.display = 'none';
        return;
    }
    
    const valor = valorInput.value.trim();
    const descricao = descricaoInput.value.trim();
    
    const payloadPix = gerarPayloadPix(valor, descricao);
    pixCodeTextarea.value = payloadPix;
    
    salvarNoHistorico(valor, descricao, payloadPix);
    
    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = '';
    
    qrcode = new QRCode(qrcodeContainer, {
        text: payloadPix,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });
    
    pixCodeContainer.style.display = 'block';
}

// ==================== COPIAR PIX ====================

if (copiarBtn) {
    copiarBtn.addEventListener('click', function() {
        pixCodeTextarea.select();
        pixCodeTextarea.setSelectionRange(0, 99999);
        
        navigator.clipboard.writeText(pixCodeTextarea.value).then(() => {
            feedbackCopiar.textContent = '✓ Código copiado!';
            feedbackCopiar.style.display = 'inline';
            
            setTimeout(() => {
                feedbackCopiar.style.display = 'none';
            }, 2000);
        }).catch(() => {
            document.execCommand('copy');
            feedbackCopiar.textContent = '✓ Código copiado!';
            feedbackCopiar.style.display = 'inline';
            
            setTimeout(() => {
                feedbackCopiar.style.display = 'none';
            }, 2000);
        });
    });
}

// ==================== SISTEMA DE HISTÓRICO E RELATÓRIO ====================

if (relatorioBtn) {
    relatorioBtn.addEventListener('click', function() {
        relatorioSenha.value = '';
        relatorioContent.style.display = 'none';
        document.getElementById('senha-relatorio-error').textContent = '';
        relatorioModal.style.display = 'block';
    });
}

if (relatorioSenha) {
    relatorioSenha.addEventListener('input', function() {
        const senhaError = document.getElementById('senha-relatorio-error');
        
        if (this.value === 'TPDM') {
            relatorioContent.style.display = 'block';
            senhaError.textContent = '';
            carregarRelatorio();
        } else if (this.value.length >= 4) {
            senhaError.textContent = 'Senha incorreta!';
            relatorioContent.style.display = 'none';
        }
    });
}

if (fecharRelatorioBtn) {
    fecharRelatorioBtn.onclick = function() {
        relatorioModal.style.display = 'none';
    }
}

tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.dataset.tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
    });
});

if (limparHistoricoBtn) {
    limparHistoricoBtn.addEventListener('click', function() {
        if (confirm('Tem certeza que deseja limpar todo o histórico de QR Codes?')) {
            localStorage.removeItem('qrcodeHistorico');
            carregarRelatorio();
            alert('Histórico limpo com sucesso!');
        }
    });
}

function carregarRelatorio() {
    const historico = JSON.parse(localStorage.getItem('qrcodeHistorico') || '[]');
    const alteracoes = JSON.parse(localStorage.getItem('contaAlteracoes') || '[]');
    
    document.getElementById('total-qrcodes').textContent = historico.length;
    document.getElementById('total-alteracoes').textContent = alteracoes.length;
    
    const tbodyQrcodes = document.getElementById('tbody-qrcodes');
    if (historico.length === 0) {
        tbodyQrcodes.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum QR Code gerado ainda</td></tr>';
    } else {
        tbodyQrcodes.innerHTML = historico.map(reg => `
            <tr>
                <td>${reg.data}</td>
                <td><strong>${reg.valor}</strong></td>
                <td>${reg.descricao}</td>
                <td>
                    <small>${reg.contaUsada.nome}</small><br>
                    <small style="color: #666;">${reg.contaUsada.chave}</small>
                </td>
            </tr>
        `).join('');
    }
    
    const tbodyAlteracoes = document.getElementById('tbody-alteracoes');
    if (alteracoes.length === 0) {
        tbodyAlteracoes.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhuma alteração de conta registrada</td></tr>';
    } else {
        tbodyAlteracoes.innerHTML = alteracoes.map(alt => `
            <tr>
                <td>${alt.data}</td>
                <td><small>${alt.chaveAntiga}</small></td>
                <td><small>${alt.chavaNova}</small></td>
                <td>
                    <small>${alt.nomeNovo}</small><br>
                    <small style="color: #666;">${alt.cidadeNova}</small>
                </td>
            </tr>
        `).join('');
    }
}

function salvarNoHistorico(valor, descricao, payloadPix) {
    const historico = JSON.parse(localStorage.getItem('qrcodeHistorico') || '[]');
    
    const registro = {
        id: Date.now(),
        data: new Date().toLocaleString('pt-BR'),
        valor: valor,
        descricao: descricao,
        payload: payloadPix,
        contaUsada: {
            chave: CHAVE_PIX,
            nome: NOME_RECEBEDOR,
            cidade: CIDADE_RECEBEDOR
        }
    };
    
    historico.unshift(registro);
    
    if (historico.length > 100) {
        historico.pop();
    }
    
    localStorage.setItem('qrcodeHistorico', JSON.stringify(historico));
}

function registrarAlteracaoConta(chaveAntiga, chavaNova) {
    const historicoAlteracoes = JSON.parse(localStorage.getItem('contaAlteracoes') || '[]');
    
    const alteracao = {
        id: Date.now(),
        data: new Date().toLocaleString('pt-BR'),
        chaveAntiga: chaveAntiga,
        chavaNova: chavaNova,
        nomeNovo: NOME_RECEBEDOR,
        cidadeNova: CIDADE_RECEBEDOR
    };
    
    historicoAlteracoes.unshift(alteracao);
    
    if (historicoAlteracoes.length > 50) {
        historicoAlteracoes.pop();
    }
    
    localStorage.setItem('contaAlteracoes', JSON.stringify(historicoAlteracoes));
}
