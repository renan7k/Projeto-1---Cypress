/// <reference types="cypress" /> 
import { format, prepareLocalStorage} from '../support/utils'


//exibir informações da documentação ao passar o cursor

// cy.viewport
// arquivos de config
// configs por linha de comando
context('Dev Finances Agilizei', () => {
    
    //hooks = trechos de código que executam antes e depois do teste
        //before-> antes de todos os testes
        //beforeEach -> antes de cada teste
        //after -> depois de todos os testes
        //aftereach -> depois de cada teste

        //inclusão dos registros no localStorage  - Consultar saldo
    beforeEach(() => {
        cy.visit('devfinance-agilizei.netlify.app',{
            onBeforeLoad: (win) => {
                prepareLocalStorage(win)
            }
        })
    });

    it('Cadastrar entradas', () => {
        cy.get('#transaction .button') //mapeamento usando ID e class
            .click()
        cy.get('#description') //mapeando usando ID
            .type('Salário')
        cy.get('[name=amount]') //mapeando via atributo
            .type('9800')
        cy.get('[type=date]')
            .type('2022-07-21')
        cy.get('button').contains('Salvar') //mapeando por tipo e valor(conteúdo)
            .click()

        cy.get('#data-table tbody tr').should('have.length', 3) //Validando o tamanho da lista
    });

    it('Cadastrar saídas', () => {
        cy.get('#transaction .button').click()
        cy.get('#description').type('Contas')
        cy.get('[name=amount]').type('-4232')
        cy.get('[type=date]').type('2022-07-22')
        cy.get('button').contains('Salvar').click()
        cy.get('#data-table tbody tr').should('have.length', 3)
    });

    it('Remover entrada e saída', () => {
        const entrada = 'Mesada'
        const saida = 'Cinema'

        cy.get('#transaction .button').click()
        cy.get('#description').type(entrada)
        cy.get('[name=amount]').type('200')
        cy.get('[type=date]').type('2022-07-19')
        cy.get('button').contains('Salvar').click()
        
        cy.get('#transaction .button').click()
        cy.get('#description').type(saida)
        cy.get('[name=amount]').type('-59')
        cy.get('[type=date]').type('2022-07-20')
        cy.get('button').contains('Salvar').click()
        
        // 1º estratégia: Voltar para o elemento pai (tr)(linha) e buscar o atributo específico
        cy.get('td.description')
            .contains(entrada)
            .parent() //busca pelo pai
            .find('img[onclick*=remove]')
            .click()

        //2º estrategia: buscar todos os irmãos do elemente, e buscar o o que tem img
        cy.get('td.description')
            .contains(saida)
            .siblings()  //busca dos elementos irmãos
            .children('img[onclick*=remove]').click() // apenas o elemento tr possui filho

        cy.get('#data-table tbody tr').should('have.length', 2)
    });

    it('Validar saldo com diversas transações', () => {
        // nn foi necessário inserir entradas e saídas, pois 2 registros foram inseridos no localStorage
        
        // capturar as linhas com as transações
        // capturar o textto da coluna valor
        // formatar esses valores da coluna valor

        //somar os valores de entradas e saídas
        // capturar o texto do "total"
        // comparar o somatório de entradas e saídas com o total

        let incomes = 0
        let expenses = 0

        cy.get('#data-table tbody tr')
          .each(($el, index, $list) => {
            cy.get($el).find('td.income, td.expense').invoke('text').then( text => {
                if (text.includes('-')){
                    expenses = expenses + format(text)
                }
                else{
                    incomes = incomes + format(text)
                }
                cy.log('entradas',incomes)
                cy.log('saídas',expenses)
              })

          })
        
        cy.get('#totalDisplay').invoke('text').then(text=>{

            let formattedTotalDisplay = format(text)
            let expectedTotal = incomes + expenses

            expect(formattedTotalDisplay).to.eq(expectedTotal)

        })
    });
});