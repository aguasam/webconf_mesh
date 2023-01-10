const { armazenaMensagem, pegarDataAtual, enviarMensagem, receberMensagem, exibirHistoricoMensagens } = require('./Chat');

describe('Testando funções de Chat', () => {
    test('Testando pegarDataAtual()', () => {
        expect(pegarDataAtual()).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
    });
    test('Testando armazenaMensagem()', () => {
        let mensagem = {
            usuario: 'Test User',
            conteudo: 'Test Message',
            data: pegarDataAtual()
        };
        armazenaMensagem(mensagem);
        expect(ultimas_mensagens.length).toBe(1);
        expect(ultimas_mensagens[0]).toEqual(mensagem);
    });
    test('Testando enviarMensagem()', () => {
        const socket = {
            emit: jest.fn()
        };
        let mensagem = 'Test Message';
        enviarMensagem(socket, 'Test User', mensagem);
        expect(socket.emit).toHaveBeenCalledWith('mensagem', {
            usuario: 'Test User',
            conteudo: mensagem,
            data: pegarDataAtual()
        });
    });
    test('Testando receberMensagem()', () => {
        const socket = {
            on: jest.fn()
        };
        receberMensagem(socket);
        expect(socket.on).toHaveBeenCalledWith('mensagem', expect.any(Function));
    });
    test('Testando exibirHistoricoMensagens()', () => {
        let mensagem = {
            usuario: 'Test User',
            conteudo: 'Test Message',
            data: pegarDataAtual()
        };
        armazenaMensagem(mensagem);
        let div = document.createElement('div');
        div.setAttribute("id","historico_mensagens");
        document.body.appendChild(div);
        exibirHistoricoMensagens();
        expect(div.childNodes.length).toBe(1);
    });
});