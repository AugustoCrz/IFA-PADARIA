<template>
    <div>
        <script src="https://kit.fontawesome.com/6c1b2d82eb.js" crossorigin="anonymous"></script>

        <div id="rodape_lateral">
            <div class="invent-cards">
                <img id="logo_app" src="~/assets/logo.png" />
            </div>

            <div id="buttons_nav">
                <!-- Botão de Inicio -->
                <b-navbar-nav>
                    <b-nav-item class='icons_nav_menu' v-on:click="desativa_views(0)">
                        <h3 class="buttn_icon_menu">Página inicial</h3>
                    </b-nav-item>

                    <!-- Botão do marketplace -->
                    <b-nav-item class='icons_nav_menu' v-on:click="
                        desativa_views(1)">
                        <h3 class="buttn_icon_menu">Produtos</h3>
                    </b-nav-item>
                </b-navbar-nav>
            </div>
        </div>

        <!-- Marketplace -->
        <div class="invent-cards content_page" v-if="marketplaceView">
            <div>
                <h2>Produtos da padaria</h2>

                <a href="#" class="icon_carrinho_compras" v-on:click="abrir_carrinho()">
                    <h2 id="text_carrinho">Carrinho <i class="fas fa-dolly"></i></h2>
                </a>
            </div>
            <hr />
            <!-- <input type="text" class="search" placeholder="Pesquisar por um produto"> -->

            <!-- Lojas em destaque -->
            <div id="lista_lojas_destaque_marketplace" v-if="(lojas.length > 0)">

                <br />
                <h4>Lojas em destaque <i class="fas fa-store"></i></h4>

                <div id="lista_lojas_marketplace">
                    <div v-for="(loja, index) in lojas" v-if="(index <= 2)">
                        <a href="#">
                            <div class="item_loja_marketplace_destaque" v-on:click="abrir_painel_loja(loja)">
                                <h3>{{loja.nome}}</h3>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Produtos do marketplace -->
            <div id="lista_itens_marketplace">
                <div v-for="produto in produtos">

                    <a href="#">
                        <div class="item_marketplace">
                            <h3 class="nome_item_marketplace">{{produto.nome}}</h3>

                            <p class="preco_item_marketplace">R${{produto.preco}}</p>

                            <div class="opcoes_item" v-if="modo_develop">
                                <p class="btn_opcao_item" v-b-modal.modal-produto v-on:click="objeto_edita(1, produto.id)"><i class="fas fa-pen"></i></p>

                                <p class="btn_opcao_item btn_opcao_excluir" v-on:click="removeSelectedProduto(produto.id)"><i class="fas fa-trash"></i></p>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>

        <!-- Carrinho de compras -->
        <div id="painel_carrinho_preview" v-if="carrinhoPainelView">

            <h2>Seu carrinho de compras <i class="fas fa-"></i></h2>

            <!-- <div>
                <hr />
                <h3>Seu carrinho está vazio! Adicione produtos para poder visualizar por aqui!</h3>
            </div> -->

            <a href="#" class="a_btn_link"><p class="btn_item btn_retornar_pag" style="float: right; margin-top: 25px;" v-on:click="carrinhoPainelView = false">Retornar</p></a>
        </div>

        <!-- Modal para inserir ou editar produto -->
        <b-modal id="modal-produto" :title="titulo_modal" hide-footer>
            <b-overlay :show="prancheta_produto" rounded="sm">
                <b-form v-on:submit="operacao">
                    <label class="mr-sm-2" for="input_nome_produto">Nome do item:</label>
                    <b-form-input id="input_nome_produto" v-model="objetoProduto.nome" class="mb-2 mr-sm-2 mb-sm-0"
                        placeholder="Ex: Chinelos" required></b-form-input> <br /> 

                    <label class="mr-sm-2" for="input_quantidade">Quantidade em estoque:</label>
                    <b-form-input v-model="objetoProduto.quantidade" id="input_quantidade" class="mb-2 mr-sm-2 mb-sm-0"
                        type="number" required></b-form-input>
                    <br />

                    <label class="mr-sm-2" for="input_preco">Preço:</label>
                    <b-form-input v-model="objetoProduto.preco" id="input_preco" class="mb-2 mr-sm-2 mb-sm-0"
                        type="number" required></b-form-input>
                    <br /> <br />

                    <b-button v-if="!btn_edit_produto" type="submit" variant="primary"
                        v-on:click="prancheta_produto = !prancheta_produto">Cadastrar</b-button>
                    <b-button v-if="btn_edit_produto" type="submit" variant="primary"
                        v-on:click="btn_edit_produto = !btn_edit_produto">Atualizar</b-button>

                    <b-button type="reset" variant="danger">Limpar formulário</b-button>
                </b-form>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
export default {
    async asyncData({ store, $axios, redirect }) {

        const authToken = 'null'
        // se tiver carregando client side, recupera o token do usuário

        // Check if user is logged in.
        if (authToken === null) {
            // This means that there ISN'T JWT and no user is logged in.
            $axios.defaults.headers.common.Authorization = null;
            redirect("/");
        } else {
            // This means that there IS a JWT so someone must be logged in.
            $axios.defaults.headers.common.Authorization = `Bearer ${authToken}`; 
            // salva o token para usar nos headers nas requisições
        }

        let produtos;

        try {
            const response = await $axios.$get('produto');
            produtos = response;
        } catch (ex) {
            console.log(ex);
        }

        return { produtos }
    },

    name: 'IndexPage',
    data: function () {
        return {
            show: false,
            inicioView: true,
            produtosView: false,
            carrinhoView: false,

            operacao: this.createNewProduto,

            titulo_modal: 'Cadastro de produto',
            btn_edit_produto: false,

            prancheta_produto: false,

            objetoProduto: {
                nome: null,
                quantidade: null,
                categoria: null,
                preco: null,
                idLoja: null
            },

            produtos: [],
        };
    },

    methods: {

        deslogar: function() {
            window.location.href = "/";
        },

        develop: function() {
            this.modo_develop = !this.modo_develop;

            this.viewConfigAnterior = null;
            this.usuariosRegistradosView = false;
        },

        objeto_adicionar: function(caso){

            // 0 -> Loja, 1 -> Produto, 2 -> Ação, 3 -> Conta
            if (caso == 0) { // Loja
                this.objetoLoja = {
                    nome: null,
                    endereco: null,
                    telefone: null,
                    vendas: 0,
                    saldo: 0
                }

                this.btn_edit_loja = false;
                this.titulo_modal = "Nova Loja";
                this.operacao = this.createNewLoja;
            } else if(caso == 1) {
                this.objetoProduto = {
                    nome: null,
                    quantidade: null,
                    categoria: null,
                    preco: null,
                    idLoja: 0
                },

                this.btn_edit_produto = false;
                this.titulo_modal = "Cadastro de Produto";
                this.operacao = this.createNewProduto;
            } else if(caso == 2) {
                this.objetoAcao = {
                    nome: null,
                    tipo: null,
                    preco: null
                },

                this.btn_edit_acao = false;
                this.titulo_modal = "Cadastro de Ação";
                this.operacao = this.createNewAcao;
            } else {
                this.objetoConta = {
                    nome: null,
                    sobrenome: null,
                    endereco: null,
                    saldo: 0
                },

                this.btn_edit_conta = false;
                this.titulo_modal = "Cadastro de Conta";
                this.operacao = this.createNewConta;
            }
        },

        desativa_views: function (alvo) {

            this.inicioView = false;
            this.marketplaceView = false;
            this.acoesView = false;
            this.configsView = false;
            this.lojaPainelView = false;
            this.acaoPainelView = false;
            this.carrinhoPainelView = false;
            this.contaPainelView = false;

            // 0 -> Inicio, 1 -> Marketplace, 2 -> Acoes, 3 -> Configurações
            if(alvo == 0)
                this.inicioView = true;
            else if(alvo == 1)
                this.marketplaceView = true;
            else if(alvo == 2)
                this.acoesView = true;
            else
                this.configsView = true;
        },

        objeto_edita: function(caso, id_alvo){

            // 0 -> Loja, 1 -> Produto, 2 -> Ação, 3 -> Conta
            if(caso == 0) { // Loja
                this.$axios.$get(`loja/${id_alvo}`).then((response) => {
                    this.objetoLoja = response[0];

                    this.titulo_modal = "Atualizar Loja";
                    this.operacao = this.updateSelectedLoja;
                    this.btn_edit_loja = true;
                })
            } else if(caso == 1) {
                this.$axios.$get(`produto/${id_alvo}`).then((response) => {
                    this.objetoProduto = response[0];

                    this.titulo_modal = "Atualizar Produto";
                    this.operacao = this.updateSelectedProduto;
                    this.btn_edit_produto = true;
                });
            } else if(caso == 2) {
                this.$axios.$get(`acao/${id_alvo}`).then((response) => {
                    this.objetoAcao = response[0];

                    this.titulo_modal = "Atualizar Ação";
                    this.operacao = this.updateSelectedAcao;
                    this.btn_edit_acao = true;
                })
            } else {
                this.$axios.$get(`conta/${id_alvo}`).then((response) => {
                    this.objetoConta = response[0];

                    this.titulo_modal = "Atualizar Conta";
                    this.operacao = this.updateSelectedConta;
                    this.btn_edit_conta = true;
                })
            }
        },

        ordena_amostragem: function (caso){

            // 0 -> Lojas, 1 -> Produtos, 2 -> Ações 
            this.lojasRegistradasView = false;
            this.acoesRegistradasView = false;
            this.produtosRegistradosView = false;
            this.usuariosRegistradosView = false;

            if(caso !== this.viewConfigAnterior){
                if(caso == 0)
                    this.lojasRegistradasView = true;
                else if(caso == 1)
                    this.produtosRegistradosView = true;
                else if(caso == 2)
                    this.acoesRegistradasView = true;
                else
                    this.usuariosRegistradosView = true;
            }else{
                this.lojasRegistradasView = false;
                this.acoesRegistradasView = false;
                this.usuariosRegistradosView = false;
                this.produtosRegistradosView = false;

                caso = null;
            }

            this.viewConfigAnterior = caso
        },

        abrir_carrinho: function() {

            this.carrinhoPainelView = true;
        },

        abrir_painel_loja: function (dados) {

            this.objetoLoja = dados;
            this.atualiza_itens_loja(dados.id);
        },

        abrir_painel_acao: function (dados) {

            this.objetoAcao = dados;
            this.acaoPainelView = true;
        },

        abrir_painel_conta: function (dados) {

            this.objetoConta = dados;
            this.contaPainelView = true;
        },

        atualiza_itens_loja: function (id_loja) {

            this.lojaPainelView = false;

            this.objetoProduto.idLoja = id_loja;
            this.id_loja_alvo = id_loja;

            this.produtos_loja = [];

            for(let i = 0; i < this.produtos.length; i++){
                if(this.produtos[i].idLoja == id_loja)
                    this.produtos_loja.push(this.produtos[i])
            }

            this.lojaPainelView = true;
        },

        createNewProduto: function (event) {
            event.preventDefault();

            // Veja mais sobre em https://axios.nuxtjs.org/usage
            this.$axios
                .$post("produto", this.objetoProduto)
                .then(() => {
                    this.updateProduto();

                    this.$bvModal.hide('modal-produto');
                    this.operacao = this.createNewProduto;
                })
                .catch((error) => {
                    console.error('Não foi possível criar um novo produto');
                    console.log(error);
                });
        },

        updateSelectedProduto: function (event) {
            event.preventDefault();

            this.$axios
            .$post("produto/update", this.objetoProduto)
            .then(() => {
                this.updateProduto();

                this.$bvModal.hide('modal-produto');
                this.operacao = this.createNewProduto;
            })
            .catch((error) => {
                console.error('Não foi possível atualizar o produto selecionado.');
                console.log(error);
            });
        },

        updateProduto: function () {
            this.$axios.$get("produto").then((response) => {
                this.produtos = response;

                this.$bvModal.hide('modal-produto');
                this.operacao = this.createNewProduto;

                if(this.produtos.length < 1)
                    this.produtosRegistradosView = false;
            })
        },

        removeSelectedProduto: function (id) {
            this.$axios.$delete(`produto/${id}`).then(() => {
                this.updateProduto();
            })
        },
    }
}
</script>

<style scoped>
@import '../static/style.css';
</style>