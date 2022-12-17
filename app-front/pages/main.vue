<template>
    <div>
        <div id="rodape_lateral">
            <div id="buttons_nav">
                <b-navbar-nav>
                    <b-nav-item class='icons_nav_menu' v-on:click="
                    inicioView = true
                    produtosView = false">
                        <h3 class="buttn_icon_menu">Inicio</h3>
                    </b-nav-item>

                    <b-nav-item class='icons_nav_menu' v-on:click="
                    inicioView = false
                    produtosView = true">
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

            <!-- Produtos do marketplace -->
            <div id="lista_itens_marketplace">
                <div v-for="produto in produtos">
                    <a href="#">
                        <div class="item_marketplace">
                            <h3 class="nome_item_marketplace">{{ produto.nome }}</h3>

                            <p class="preco_item_marketplace">R${{ produto.preco }}</p>

                            <div class="opcoes_item" v-if="modo_develop">
                                <p class="btn_opcao_item" v-b-modal.modal-produto
                                    v-on:click="objeto_edita(produto.id)"><i class="fas fa-pen"></i></p>

                                <p class="btn_opcao_item btn_opcao_excluir"
                                    v-on:click="removeSelectedProduto(produto.id)"><i class="fas fa-trash"></i></p>
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

            <a href="#" class="a_btn_link">
                <p class="btn_item btn_retornar_pag" style="float: right; margin-top: 25px;"
                    v-on:click="carrinhoPainelView = false">Retornar</p>
            </a>
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

        deslogar: function () {
            window.location.href = "/";
        },

        develop: function () {
            this.modo_develop = !this.modo_develop;

            this.viewConfigAnterior = null;
            this.usuariosRegistradosView = false;
        },

        objeto_adicionar: function (caso) {

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
        },

        objeto_edita: function (id_alvo) {
            this.$axios.$get(`produto/${id_alvo}`).then((response) => {
                this.objetoProduto = response[0];

                this.titulo_modal = "Atualizar Produto";
                this.operacao = this.updateSelectedProduto;
                this.btn_edit_produto = true;
            });
        },

        abrir_carrinho: function () {

            this.carrinhoPainelView = true;
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

                if (this.produtos.length < 1)
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