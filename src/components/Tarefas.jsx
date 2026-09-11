import { useState, useEffect } from 'react'

// Chave usada para guardar as tarefas no localStorage do navegador.
const STORAGE_KEY = 'items-tarefas'

// Estado inicial de uma nova tarefa (usado no formulario e no reset apos cadastrar).
const TAREFA_VAZIA = {
    nome: '',
    data: '',
    descricao: '',
    prioridade: 'media',
}

const Tarefas = () => {
    // HOOK useState - lista de tarefas.
    // A funcao passada para o useState roda apenas na primeira renderizacao (lazy init):
    // ela le o localStorage e devolve o array salvo ou um array vazio.
    const [tarefas, setTarefas] = useState(() => {
        const salvos = localStorage.getItem(STORAGE_KEY)
        return salvos ? JSON.parse(salvos) : []
    })

    // HOOK useState - controla os campos do formulario de cadastro.
    const [form, setForm] = useState(TAREFA_VAZIA)

    // HOOK useState - controla o filtro de visualizacao atual.
    // Valores possiveis: 'todas' | 'pendentes' | 'concluidas'.
    const [filtro, setFiltro] = useState('todas')

    // HOOK useEffect - efeito colateral de persistencia.
    // Sempre que o array `tarefas` mudar, grava a versao atualizada no localStorage.
    // O array de dependencias [tarefas] evita gravacoes desnecessarias.
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas))
    }, [tarefas])

    // CALLBACK - atualiza um campo do formulario conforme o usuario digita.
    // Recebe o evento do input, le name/value e faz merge no estado anterior.
    const aoDigitar = (e) => {
        const { name, value } = e.target
        setForm((anterior) => ({ ...anterior, [name]: value }))
    }

    // CALLBACK - dispara no submit do formulario para cadastrar a tarefa.
    const adicionarTarefa = (e) => {
        e.preventDefault()
        if (!form.nome.trim()) return

        const novaTarefa = {
            id: Date.now(),
            nome: form.nome.trim(),
            data: form.data,
            descricao: form.descricao.trim(),
            prioridade: form.prioridade,
            concluida: false,
        }

        // Cria um novo array (imutabilidade) com a tarefa nova no final.
        setTarefas((anterior) => [...anterior, novaTarefa])
        setForm(TAREFA_VAZIA)
    }

    // CALLBACK - alterna o campo `concluida` da tarefa cujo id foi clicado.
    // `map` percorre a lista e devolve um novo array: a tarefa alvo vem com
    // `concluida` invertido, as demais seguem iguais.
    const alternarConcluida = (id) => {
        setTarefas((anterior) =>
            anterior.map((tarefa) =>
                tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
            )
        )
    }

    // CALLBACK - remove a tarefa clicada.
    // `filter` devolve um novo array apenas com as tarefas cujo id e diferente do alvo.
    const removerTarefa = (id) => {
        setTarefas((anterior) => anterior.filter((tarefa) => tarefa.id !== id))
    }

    // Aplica o filtro atual usando `filter`.
    // 'todas' devolve a lista inteira; os outros comparam o campo `concluida`.
    const tarefasVisiveis = tarefas.filter((tarefa) => {
        if (filtro === 'pendentes') return !tarefa.concluida
        if (filtro === 'concluidas') return tarefa.concluida
        return true
    })

    const filtros = [
        { chave: 'todas', rotulo: 'Todas' },
        { chave: 'pendentes', rotulo: 'Pendentes' },
        { chave: 'concluidas', rotulo: 'Concluidas' },
    ]

    return (
        <div className="todo-container">
            <h1>Minha lista de Tarefas</h1>

            <form onSubmit={adicionarTarefa} className="todo-form">
                <input
                    type="text"
                    name="nome"
                    value={form.nome}
                    placeholder="Nome da tarefa"
                    className="todo-input"
                    onChange={aoDigitar}
                />
                <input
                    type="date"
                    name="data"
                    value={form.data}
                    className="todo-input"
                    onChange={aoDigitar}
                />
                <textarea
                    name="descricao"
                    value={form.descricao}
                    placeholder="Descricao"
                    className="todo-input"
                    onChange={aoDigitar}
                />
                <select
                    name="prioridade"
                    value={form.prioridade}
                    className="todo-input"
                    onChange={aoDigitar}
                >
                    <option value="baixa">Prioridade baixa</option>
                    <option value="media">Prioridade media</option>
                    <option value="alta">Prioridade alta</option>
                </select>
                <button type="submit" className="btn-add">
                    Adicionar
                </button>
            </form>

            <div className="todo-filtros">
                {/* `map` gera um botao por filtro; a classe muda quando o filtro esta ativo. */}
                {filtros.map((item) => (
                    <button
                        key={item.chave}
                        className={filtro === item.chave ? 'btn-filtro ativo' : 'btn-filtro'}
                        onClick={() => setFiltro(item.chave)}
                    >
                        {item.rotulo}
                    </button>
                ))}
            </div>

            <ul className="todo-list">
                {/* `map` transforma cada tarefa visivel em um <li>. */}
                {tarefasVisiveis.map((tarefa) => (
                    <li
                        key={tarefa.id}
                        className={tarefa.concluida ? 'todo-item concluida' : 'todo-item'}
                    >
                        <div className="todo-info">
                            <span className="todo-nome">{tarefa.nome}</span>
                            <span className={`todo-prioridade prioridade-${tarefa.prioridade}`}>
                                {tarefa.prioridade}
                            </span>
                            {tarefa.data && <span className="todo-data">{tarefa.data}</span>}
                            {tarefa.descricao && (
                                <p className="todo-descricao">{tarefa.descricao}</p>
                            )}
                        </div>
                        <div className="todo-acoes">
                            <button
                                onClick={() => alternarConcluida(tarefa.id)}
                                className="btn-concluir"
                            >
                                {tarefa.concluida ? 'Reabrir' : 'Concluir'}
                            </button>
                            <button
                                onClick={() => removerTarefa(tarefa.id)}
                                className="btn-delete"
                            >
                                Excluir
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {tarefasVisiveis.length === 0 && (
                <p className="todo-vazio">Nenhuma tarefa nessa visualizacao</p>
            )}
        </div>
    )
}

export default Tarefas
