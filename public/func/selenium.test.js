const {Builder, By, Key, Util} = require('selenium-webdriver');
require('chromedriver');
var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder()

let driver1, driver2;

const getCapabilities = (browserName) => {
    switch (browserName) {
      case "chrome":
        return {
          browserName: "chrome",
          acceptInsecureCerts: true,
          "goog:chromeOptions": {
            args: [
              "--use-fake-ui-for-media-stream",
              "--use-fake-device-for-media-stream",
              //"--headless",
            ],
          },
        };
    }
}

//Func que abre os dois peers para a execução dos testes.
async function peers (){
    //Abrindo chrome e firefox
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    driver1 = await new Builder().withCapabilities(getCapabilities('chrome')).build();
    await driver1.get('http://localhost:3000/');
    await sleep(1000);
    await driver1.findElement(By.name('apelido')).sendKeys('carlof', Key.RETURN);


    driver2 = await new Builder().withCapabilities(getCapabilities('chrome')).build();
    await driver2.get('http://localhost:3000/');
    await sleep(1000);

    await driver2.findElement(By.name('apelido')).sendKeys('aguasam ', Key.RETURN);
    //await driver2.findElement(By.name('apertar')).click();

    //coloca o http://localhost:3000/statsw

    return [driver1, driver2]

}

/*trocar as classes dos obj css desses testes*/

describe('Testes automatizados', ()=>{

    //Aumentando o valor máximo de simulação
    jest.setTimeout(15000);


    it('Testando abrir dois peers de maneira automatizada.', async ()=>{

        [driver1, driver2] = await peers();
        expect(driver1).toBeDefined()
        expect(driver2).toBeDefined()
 
    })

    
    it('Testando troca de mensagens pelo chat.', async ()=>{

      //Escrevendo mensagem 
      await driver1.findElement(By.name('texto_mensagem')).sendKeys('Opa, tudo bem ai?', Key.RETURN);
      const mensagem = await driver2.findElement(By.name('historico_mensagens')).findElement(By.className('privada')).getText();

      expect(mensagem).toMatch('carlof diz: Opa, tudo bem ai?');
    
    }, 120000)
    
});