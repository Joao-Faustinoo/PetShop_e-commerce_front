/**
 * [VIEW] Tela: Detalhe do cliente
 *
 * O QUE FAZ: mostra o cadastro completo de um cliente e todas as suas transações.
 *
 * COMO FARÁ: lê o id da rota e usa o useClienteController para dados, endereços,
 * cartões e pets, e o useTransacoesClienteController para o histórico de
 * compras exigido pela RF0025. Permite alterar os dados cadastrais.
 *
 * ATENDE: RF0022, RF0025, RN0027
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

import StatusBadge from '@/components/Cards/StatusBadge';
import ClienteForm from '@/components/Forms/ClienteForm/ClienteForm';
import { useClienteController } from '@/controllers/clientes/useClienteController';
import { useClienteFormController } from '@/controllers/clientes/useClienteFormController';
import { useTransacoesClienteController } from '@/controllers/clientes/useTransacoesClienteController';
import {
  nomeDoDominio,
  useDominiosController,
} from '@/controllers/dominios/useDominiosController';
import { Genero } from '@/types/clientes/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { mascararCartao } from '@/utils/masks';

import * as S from './styles';

const AdminClienteDetalhe = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { cliente, faixaRanking, isLoading } = useClienteController(Number(id));
  const { transacoes, totalGasto, quantidadeCompras } =
    useTransacoesClienteController(Number(id));
  const { alterar, isPending } = useClienteFormController(cliente);
  const { bandeiras, tiposTelefone } = useDominiosController();

  if (isLoading || !cliente) {
    return (
      <S.Container>
        <S.Vazio>
          <strong>Carregando cliente...</strong>
        </S.Vazio>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Voltar type="button" onClick={() => router.push('/admin/clientes')}>
        <FiArrowLeft size={16} /> Voltar para clientes
      </S.Voltar>

      <S.Cabecalho>
        <S.Titulo>
          <h1>{cliente.nome}</h1>
          <p>
            {cliente.codigo} · {cliente.email} ·{' '}
            {nomeDoDominio(tiposTelefone, cliente.telefone.tipoId)} (
            {cliente.telefone.ddd}) {cliente.telefone.numero}
          </p>
        </S.Titulo>
      </S.Cabecalho>

      <S.Resumo>
        <S.Indicador>
          <small>Situação</small>
          <strong>{cliente.ativo ? 'Ativo' : 'Inativo'}</strong>
        </S.Indicador>

        {/* RN0027: o ranking sai do perfil de compras. */}
        <S.Indicador>
          <small>Ranking</small>
          <strong>
            {cliente.ranking} · {faixaRanking}
          </strong>
        </S.Indicador>

        <S.Indicador>
          <small>Compras</small>
          <strong>{quantidadeCompras}</strong>
        </S.Indicador>

        <S.Indicador>
          <small>Total gasto</small>
          <strong>{formatCurrency(totalGasto)}</strong>
        </S.Indicador>
      </S.Resumo>

      {!cliente.ativo && cliente.justificativaInativacao && (
        <S.Alerta $tipo="alerta">
          Cadastro inativado: {cliente.justificativaInativacao}
        </S.Alerta>
      )}

      <S.DuasColunas>
        <div>
          {/* RF0025: todas as transações já realizadas pelo cliente. */}
          <S.Bloco>
            <S.TituloSecao>Transações realizadas</S.TituloSecao>

            {transacoes.length === 0 ? (
              <S.Vazio>
                <strong>Nenhuma compra registrada</strong>
              </S.Vazio>
            ) : (
              <S.TabelaWrapper>
                <S.Tabela>
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Data</th>
                      <th className="numero">Itens</th>
                      <th className="numero">Total</th>
                      <th>Situação</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transacoes.map(pedido => (
                      <tr key={pedido.id}>
                        <td>{pedido.numero}</td>
                        <td>{formatDate(pedido.dataCompra)}</td>
                        <td className="numero">
                          {pedido.itens.reduce(
                            (soma, item) => soma + item.quantidade,
                            0,
                          )}
                        </td>
                        <td className="numero">
                          {formatCurrency(pedido.total)}
                        </td>
                        <td>
                          <StatusBadge status={pedido.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </S.Tabela>
              </S.TabelaWrapper>
            )}
          </S.Bloco>

          {/* RF0022: alteração dos dados cadastrais. */}
          <S.Bloco>
            <S.TituloSecao>Dados cadastrais</S.TituloSecao>

            <ClienteForm
              cliente={cliente}
              isPending={isPending}
              onSubmit={dados =>
                alterar({
                  id: cliente.id,
                  nome: dados.nome,
                  genero: dados.genero as Genero,
                  dataNascimento: dados.dataNascimento,
                  cpf: dados.cpf,
                  email: dados.email,
                  telefone: {
                    tipoId: dados.telefoneTipoId,
                    ddd: dados.telefoneDDD,
                    numero: dados.telefoneNumero,
                  },
                })
              }
            />
          </S.Bloco>
        </div>

        <div>
          <S.Bloco>
            <S.TituloSecao>Endereços</S.TituloSecao>

            <S.Colecao>
              {cliente.enderecos.map(endereco => (
                <li key={endereco.id}>
                  <strong>
                    {endereco.apelido} (
                    {endereco.tipo === 'COBRANCA' ? 'cobrança' : 'entrega'})
                  </strong>
                  <br />
                  {endereco.logradouro}, {endereco.numero} · {endereco.bairro}
                  <br />
                  {endereco.cidade}/{endereco.estado} · {endereco.cep}
                </li>
              ))}
            </S.Colecao>
          </S.Bloco>

          <S.Bloco>
            <S.TituloSecao>Cartões</S.TituloSecao>

            <S.Colecao>
              {cliente.cartoes.map(cartao => (
                <li key={cartao.id}>
                  <strong>{mascararCartao(cartao.numero)}</strong>
                  {cartao.preferencial && ' · preferencial'}
                  <br />
                  {cartao.nomeImpresso} ·{' '}
                  {nomeDoDominio(bandeiras, cartao.bandeiraId)}
                </li>
              ))}
            </S.Colecao>
          </S.Bloco>

          <S.Bloco>
            <S.TituloSecao>Pets</S.TituloSecao>

            {cliente.pets.length === 0 ? (
              <S.Colecao>
                <li>Nenhum pet cadastrado.</li>
              </S.Colecao>
            ) : (
              <S.Colecao>
                {cliente.pets.map(pet => (
                  <li key={pet.id}>
                    <strong>{pet.nome}</strong>
                    <br />
                    {pet.raca} · porte {pet.porte} · {pet.peso} kg
                  </li>
                ))}
              </S.Colecao>
            )}
          </S.Bloco>
        </div>
      </S.DuasColunas>
    </S.Container>
  );
};

export default AdminClienteDetalhe;
