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

// Classes Tailwind compartilhadas pelos campos do formulario, para manter o mesmo padrao visual em todos eles.
const CAMPO_CLASSES =
    'w-full rounded-lg border border-blue-700 bg-blue-950/60 px-4 py-2 text-white placeholder-blue-400 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40'

// Cores do badge de prioridade. Fica em um mapa com a classe completa (em vez de montar
// algo como `bg-${cor}-500`) porque o Tailwind precisa ver a classe inteira e literal no
// codigo-fonte para conseguir gera-la no build.
const CORES_PRIORIDADE = {
    baixa: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40',
    media: 'bg-amber-500/15 text-amber-300 ring-amber-500/40',
    alta: 'bg-red-500/15 text-red-300 ring-red-500/40',
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
        <div className="min-h-screen rounded-xl  bg-blue-950 px-4 pb-16">
            <h1 className="py-8 text-center font-mono text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Lista de Tarefas Dev
            </h1>

            <form
                onSubmit={adicionarTarefa}
                className="mx-auto flex w-full max-w-md  flex-col gap-4 rounded-xl  bg-blue-900/40 p-6 font-mono font-bold text-white shadow-xl shadow-blue-950/50 ring-1 ring-white/10 sm:p-8"
            >
                <input
                    type="text"
                    name="nome"
                    value={form.nome}
                    placeholder="Nome da tarefa"
                    className={CAMPO_CLASSES}
                    onChange={aoDigitar}
                />
                <input
                    type="date"
                    name="data"
                    value={form.data}
                    className={`${CAMPO_CLASSES} [color-scheme:dark]`}
                    onChange={aoDigitar}
                />
                <textarea
                    name="descricao"
                    value={form.descricao}
                    placeholder="Descricao"
                    rows={3}
                    className={`${CAMPO_CLASSES} resize-none`}
                    onChange={aoDigitar}
                />
                <select
                    name="prioridade"
                    value={form.prioridade}
                    className={`${CAMPO_CLASSES} cursor-pointer`}
                    onChange={aoDigitar}
                >
                    <option value="baixa">Prioridade baixa</option>
                    <option value="media">Prioridade media</option>
                    <option value="alta">Prioridade alta</option>
                </select>
                <button
                    type="submit"
                    className="mt-1 w-full rounded-lg bg-sky-600 px-4 py-2 text-blue-950 transition hover:bg-gray-300 active:scale-[0.98]"
                >
                    Adicionar
                </button>
            </form>

            <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2 py-8 font-mono font-bold">
                {/* `map` gera um botao por filtro; a classe muda quando o filtro esta ativo. */}
                {filtros.map((item) => (
                    <button
                        key={item.chave}
                        onClick={() => setFiltro(item.chave)}
                        className={
                            filtro === item.chave
                                ? 'rounded-xl bg-sky-600 px-4 py-2 text-sm text-blue-950 transition'
                                : 'rounded-xl bg-blue-800 px-4 py-2 text-sm text-blue-200 transition hover:bg-blue-700'
                        }
                    >
                        {item.rotulo}
                    </button>
                ))}
            </div>

            <ul className="mx-auto flex max-w-2xl flex-col gap-4">
                {/* `map` transforma cada tarefa visivel em um <li>. */}
                {tarefasVisiveis.map((tarefa) => (
                    <li
                        key={tarefa.id}
                        className={
                            tarefa.concluida
                                ? 'flex flex-col gap-3 rounded-xl bg-blue-900/30 p-4 opacity-60 ring-1 ring-blue-800/60 sm:flex-row sm:items-center sm:justify-between'
                                : 'flex flex-col gap-3 rounded-xl bg-blue-900/70 p-4 ring-1 ring-blue-800 sm:flex-row sm:items-center sm:justify-between'
                        }
                    >
                        <div className="flex flex-col gap-1 font-mono text-white">
                            <span
                                className={
                                    tarefa.concluida
                                        ? 'text-lg font-bold text-blue-300 line-through'
                                        : 'text-lg font-bold text-white'
                                }
                            >
                                {tarefa.nome}
                            </span>
                            <span
                                className={`w-fit rounded-xl px-3 py-1 text-xs font-bold ring-1 ${CORES_PRIORIDADE[tarefa.prioridade]}`}
                            >
                                {tarefa.prioridade}
                            </span>
                            {tarefa.data && (
                                <span className="text-sm text-blue-300">{tarefa.data}</span>
                            )}
                            {tarefa.descricao && (
                                <p className="max-w-sm text-sm font-normal text-blue-200">
                                    {tarefa.descricao}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2 font-mono text-sm font-bold">
                            <button
                                onClick={() => alternarConcluida(tarefa.id)}
                                className={
                                    tarefa.concluida
                                        ? 'rounded-lg bg-yellow-300 px-3 py-1.5 text-blue-950 transition hover:bg-amber-400'
                                        : 'rounded-lg bg-emerald-500 px-3 py-1.5 text-blue-950 transition hover:bg-emerald-400'
                                }
                            >
                                {tarefa.concluida ? 'Reabrir' : 'Concluir'}
                            </button>
                            <button
                                onClick={() => removerTarefa(tarefa.id)}
                                className="rounded-lg bg-red-500 px-3 py-1.5 text-white transition hover:bg-red-400"
                            >
                                Excluir
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {tarefasVisiveis.length === 0 && (
                <p className="mx-auto max-w-md py-12 text-center font-mono text-white">
                    Nenhuma tarefa nessa visualizacao
                </p>
            )}
        </div>
    )
}

export default Tarefas