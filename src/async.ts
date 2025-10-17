/**
 * @fileoverview AsyncCollection - Query Builder Pattern para operaciones diferidas
 *
 * @description
 * AsyncCollection implementa un patrón de Query Builder que construye un "query plan"
 * (array de operaciones) que se ejecuta cuando se resuelve la promesa. Esto permite
 * crear abstracciones sobre cualquier fuente de datos (ORMs, APIs REST, GraphQL, etc.)
 *
 * @example
 * ### Uso básico con ORM
 * ```typescript
 * const users = new AsyncCollection(async ({ operations }) => {
 *   const conditions = operations
 *     .filter(([method]) => ['where', 'filter'].includes(method))
 *     .map(([method, ...args]) => convertToSequelize(method, args));
 *
 *   const results = await User.findAll({ where: { [Op.and]: conditions } });
 *
 *   const lastOp = operations[operations.length - 1];
 *   if (lastOp && lastOp[0] === 'first') return results[0];
 *   if (lastOp && lastOp[0] === 'last') return results[results.length - 1];
 *
 *   return results;
 * });
 *
 * // Query encadenable
 * const result = await users
 *   .where('age', '>=', 18)
 *   .where('status', 'active')
 *   .not({ deleted: true })
 *   .first();
 * ```
 *
 * @example
 * ### Con custom validators
 * ```typescript
 * const customValidators = {
 *   $isPast(ref: string, value: boolean) {
 *     return (item: any) => {
 *       const date = new Date(item[ref]);
 *       const isPast = date < new Date();
 *       return value ? isPast : !isPast;
 *     };
 *   }
 * };
 *
 * const items = new AsyncCollection(
 *   async ({ operations, validators }) => {
 *     // Usar validators para procesar operations
 *     return processData(operations, validators);
 *   },
 *   customValidators
 * );
 *
 * await items.filter({ date: { $isPast: true } });
 * ```
 */

/**
 * @description
 * Contexto de ejecución que se pasa al executor cuando se resuelve la promesa.
 * Contiene todas las operaciones registradas, validators personalizados y metadata.
 */
export interface ExecutorContext<T = any, V = any> {
  /** Array de operaciones registradas en formato [nombre_metodo, ...args] */
  operations: [string, ...any[]][];
  /** Validators personalizados para extender operadores de query() */
  validators?: V;
  /** Metadata sobre el query builder */
  metadata: {
    /** Fecha de creación del contexto */
    created_at: Date;
    /** Número total de operaciones registradas */
    operation_count: number;
    /** Profundidad de la cadena de métodos */
    chain_depth: number;
  };
}

/**
 * @description
 * Función executor que procesa el contexto y retorna los resultados.
 * Puede ser síncrona o asíncrona según las necesidades.
 *
 * @example
 * ```typescript
 * // Executor asíncrono con Sequelize
 * const executor: Executor = async ({ operations, validators }) => {
 *   const query = buildSequelizeQuery(operations);
 *   return await Model.findAll(query);
 * };
 *
 * // Executor síncrono con array en memoria
 * const executor: Executor = ({ operations }) => {
 *   let data = [...initialData];
 *   operations.forEach(([method, ...args]) => {
 *     data = applyOperation(data, method, args);
 *   });
 *   return data;
 * };
 * ```
 */
export type Executor<T = any, V = any> = (
  context: ExecutorContext<T, V>
) => T | T[] | Promise<T | T[]>;

/**
 * @description
 * AsyncCollection - Query Builder Pattern para construcción diferida de consultas.
 *
 * Esta clase registra todas las operaciones de forma encadenable y las ejecuta
 * solo cuando se resuelve la promesa (await o .then()). Esto permite crear
 * abstracciones sobre cualquier fuente de datos transformando las operaciones
 * al formato específico del ORM o API.
 *
 * @template T - Tipo de los elementos de la colección
 * @template V - Tipo de los validators personalizados
 *
 * @example
 * ### Con Prisma
 * ```typescript
 * const users = new AsyncCollection<User>(async ({ operations }) => {
 *   const where: any = {};
 *
 *   operations.forEach(([method, ...args]) => {
 *     if (method === 'where') {
 *       const [key, operator, value] = args.length === 3 ? args : [args[0], '=', args[1]];
 *       where[key] = operator === '>=' ? { gte: value } : value;
 *     }
 *   });
 *
 *   return await prisma.user.findMany({ where });
 * });
 *
 * await users.where('age', '>=', 18).where('active', true);
 * ```
 *
 * @example
 * ### Con TypeORM
 * ```typescript
 * const products = new AsyncCollection<Product>(async ({ operations }) => {
 *   const qb = getRepository(Product).createQueryBuilder('product');
 *
 *   operations.forEach(([method, ...args]) => {
 *     if (method === 'where') {
 *       qb.andWhere(`product.${args[0]} = :${args[0]}`, { [args[0]]: args[1] });
 *     } else if (method === 'sort') {
 *       qb.orderBy(`product.${args[0]}`, args[1]?.toUpperCase() || 'ASC');
 *     }
 *   });
 *
 *   const lastOp = operations[operations.length - 1];
 *   if (lastOp?.[0] === 'first') return await qb.getOne();
 *
 *   return await qb.getMany();
 * });
 *
 * await products.where('category', 'electronics').sort('price', 'desc').first();
 * ```
 */
export default class AsyncCollection<T = any, V = any> {
  /** Array de operaciones registradas */
  private operations: [string, ...any[]][] = [];

  /** Función executor que procesa las operaciones */
  private readonly executor: Executor<T, V>;

  /** Validators personalizados para query() */
  private readonly validators?: V;

  /**
   * @description
   * Crea una nueva instancia de AsyncCollection.
   *
   * @param executor - Función que procesa el contexto y retorna resultados
   * @param validators - Validators personalizados para extender operadores de query()
   *
   * @example
   * ```typescript
   * const items = new AsyncCollection(
   *   async ({ operations, validators, metadata }) => {
   *     console.log(`Procesando ${metadata.operation_count} operaciones`);
   *     return processOperations(operations);
   *   },
   *   { $custom: (ref, value) => (item) => item[ref] === value }
   * );
   * ```
   */
  constructor(executor: Executor<T, V>, validators?: V) {
    this.executor = executor;
    if (validators !== undefined) {
      this.validators = validators;
    }
  }

  /**
   * @description
   * Construye el contexto de ejecución con todas las operaciones y metadata.
   *
   * @returns ExecutorContext con operations, validators y metadata
   */
  private _build_context(): ExecutorContext<T, V> {
    const context: ExecutorContext<T, V> = {
      operations: [...this.operations],
      metadata: {
        created_at: new Date(),
        operation_count: this.operations.length,
        chain_depth: this.operations.length,
      },
    };

    if (this.validators !== undefined) {
      context.validators = this.validators;
    }

    return context;
  }

  /**
   * @description
   * Implementa el método then de la interfaz Thenable, permitiendo usar
   * await o .then() para ejecutar el executor con el contexto construido.
   *
   * @param onfulfilled - Callback cuando se resuelve la promesa
   * @param onrejected - Callback cuando se rechaza la promesa
   * @returns Promise con el resultado del executor
   *
   * @example
   * ```typescript
   * const items = new AsyncCollection(async ({ operations }) => {
   *   console.log('Operaciones:', operations);
   *   return processOperations(operations);
   * });
   *
   * // Usando .then()
   * items.where('active', true).then(results => {
   *   console.log(results);
   * });
   *
   * // Usando await
   * const results = await items.where('active', true);
   * ```
   */
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?:
      | ((value: any) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    const context = this._build_context();
    return Promise.resolve(this.executor(context)).then(onfulfilled, onrejected);
  }

  /**
   * @description
   * Implementa el método catch de la interfaz Thenable.
   *
   * @param onrejected - Callback cuando se rechaza la promesa
   * @returns Promise con el resultado
   */
  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<TResult> {
    return this.then(undefined, onrejected);
  }

  /**
   * @description
   * Implementa el método finally de la interfaz Thenable.
   *
   * @param onfinally - Callback que se ejecuta siempre
   * @returns Promise con el resultado
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<any> {
    return this.then(
      (value) => {
        onfinally?.();
        return value;
      },
      (reason) => {
        onfinally?.();
        throw reason;
      }
    );
  }

  /**
   * @description
   * Filtra la colección usando el operador where con comparaciones.
   * Soporta operadores: =, !=, >, <, >=, <=, in, includes
   *
   * @param key - Clave del campo a comparar (soporta dot notation)
   * @param operator - Operador de comparación (opcional, default '=')
   * @param value - Valor a comparar
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.where('age', '>=', 18)
   * items.where('status', 'active')  // operator '=' por defecto
   * items.where('user.profile.name', 'John')
   * ```
   */
  public where(key: string, value: any): this;
  public where(key: string, operator: string, value: any): this;
  public where(...props: any[]): this {
    this.operations.push(["where", ...props]);
    return this;
  }

  /**
   * @description
   * Filtra la colección de forma inversa al where (excluye matches).
   *
   * @param key - Clave del campo a comparar
   * @param operator - Operador de comparación (opcional)
   * @param value - Valor a comparar
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.whereNot('deleted', true)
   * items.whereNot('age', '<', 18)
   * ```
   */
  public whereNot(key: string, value: any): this;
  public whereNot(key: string, operator: string, value: any): this;
  public whereNot(...props: any[]): this {
    this.operations.push(["whereNot", ...props]);
    return this;
  }

  /**
   * @description
   * Filtra elementos usando una función o un objeto Query.
   *
   * @param handler - Función de filtrado o Query object
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.filter(item => item.age >= 18)
   * items.filter({ age: { $gte: 18 }, status: 'active' })
   * ```
   */
  public filter(handler: any): this {
    this.operations.push(["filter", handler]);
    return this;
  }

  /**
   * @description
   * Filtra elementos de forma inversa (excluye los que coinciden).
   *
   * @param handler - Función de filtrado o Query object
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.not(item => item.deleted)
   * items.not({ deleted: true })
   * ```
   */
  public not(handler: any): this {
    this.operations.push(["not", handler]);
    return this;
  }

  /**
   * @description
   * Obtiene el primer elemento que coincide con el criterio.
   *
   * @param handler - Función de filtrado o Query object (opcional)
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.where('age', '>=', 18).first()
   * items.first(item => item.active)
   * items.first({ status: 'active' })
   * ```
   */
  public first(handler?: any): this {
    this.operations.push(handler === undefined ? ["first"] : ["first", handler]);
    return this;
  }

  /**
   * @description
   * Obtiene el último elemento que coincide con el criterio.
   *
   * @param handler - Función de filtrado o Query object (opcional)
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.where('age', '>=', 18).last()
   * items.last(item => item.active)
   * ```
   */
  public last(handler?: any): this {
    this.operations.push(handler === undefined ? ["last"] : ["last", handler]);
    return this;
  }

  /**
   * @description
   * Busca el primer elemento que coincide con el criterio.
   * Alias de first() para mantener compatibilidad con Array.find()
   *
   * @param handler - Función de filtrado o Query object
   * @returns this para encadenar
   */
  public find(handler: any): this {
    this.operations.push(["find", handler]);
    return this;
  }

  /**
   * @description
   * Verifica que todos los elementos cumplan con el criterio.
   *
   * @param handler - Función de validación, Query object, o key string
   * @param value - Valor a comparar (cuando handler es string)
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.every(item => item.age >= 18)
   * items.every({ active: true })
   * items.every('status', 'active')
   * ```
   */
  public every(handler: any, value?: any): this {
    this.operations.push(
      value === undefined ? ["every", handler] : ["every", handler, value]
    );
    return this;
  }

  /**
   * @description
   * Itera sobre cada elemento ejecutando un callback.
   * El callback puede retornar false para detener la iteración.
   *
   * @param fn - Función callback para cada elemento
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.each((item, index) => {
   *   console.log(item);
   *   if (index >= 10) return false; // Detener después de 10
   * })
   * ```
   */
  public each(fn: (item: T, index: number, arr: T[]) => any): this {
    this.operations.push(["each", fn]);
    return this;
  }

  /**
   * @description
   * Transforma cada elemento usando una función map.
   *
   * @param handler - Función de transformación
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.map(item => ({ ...item, computed: item.a + item.b }))
   * ```
   */
  public map(handler: (item: T, index: number, arr: T[]) => any): this {
    this.operations.push(["map", handler]);
    return this;
  }

  /**
   * @description
   * Divide la colección en chunks de tamaño específico.
   *
   * @param size - Tamaño de cada chunk
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.chunk(10) // Divide en grupos de 10
   * ```
   */
  public chunk(size: number): this {
    this.operations.push(["chunk", size]);
    return this;
  }

  /**
   * @description
   * Agrupa elementos por una clave o función.
   *
   * @param handler - Clave string o función que retorna la clave de agrupación
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.groupBy('category')
   * items.groupBy(item => item.date.getFullYear())
   * ```
   */
  public groupBy(handler: string | ((item: T, index: number, arr: T[]) => string | number)): this {
    this.operations.push(["groupBy", handler]);
    return this;
  }

  /**
   * @description
   * Cuenta elementos agrupados por clave o función.
   *
   * @param handler - Clave string o función que retorna la clave de agrupación
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.countBy('status') // { active: 10, inactive: 5 }
   * ```
   */
  public countBy(handler: string | ((item: T, index: number, arr: T[]) => string | number)): this {
    this.operations.push(["countBy", handler]);
    return this;
  }

  /**
   * @description
   * Ordena elementos por clave o función comparadora.
   *
   * @param handler - Clave string o función comparadora
   * @param direction - Dirección 'asc' o 'desc' (cuando handler es string)
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.sort('price', 'desc')
   * items.sort((a, b) => a.price - b.price)
   * ```
   */
  public sort(handler?: string | ((a: T, b: T) => number), direction?: "asc" | "desc"): this {
    this.operations.push(
      direction === undefined ? ["sort", handler] : ["sort", handler, direction]
    );
    return this;
  }

  /**
   * @description
   * Invierte el orden de los elementos.
   *
   * @returns this para encadenar
   */
  public reverse(): this {
    this.operations.push(["reverse"]);
    return this;
  }

  /**
   * @description
   * Desordena aleatoriamente los elementos.
   *
   * @returns this para encadenar
   */
  public shuffle(): this {
    this.operations.push(["shuffle"]);
    return this;
  }

  /**
   * @description
   * Obtiene elementos aleatorios.
   *
   * @param length - Cantidad de elementos aleatorios
   * @returns this para encadenar
   */
  public random(length: number = Infinity): this {
    this.operations.push(["random", length]);
    return this;
  }

  /**
   * @description
   * Obtiene un slice de la colección.
   *
   * @param start - Índice inicial
   * @param end - Índice final (opcional)
   * @returns this para encadenar
   */
  public slice(start: number, end?: number): this {
    this.operations.push(end === undefined ? ["slice", start] : ["slice", start, end]);
    return this;
  }

  /**
   * @description
   * Obtiene solo elementos únicos por clave o función.
   *
   * @param handler - Clave string o función que retorna el identificador único
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.unique('email')
   * items.unique(item => item.user.id)
   * ```
   */
  public unique(handler: string | ((item: T, index: number, arr: T[]) => any)): this {
    this.operations.push(["unique", handler]);
    return this;
  }

  /**
   * @description
   * Suma valores de una clave o función.
   *
   * @param handler - Clave string o función que retorna el valor numérico
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.sum('price')
   * items.sum(item => item.price * item.quantity)
   * ```
   */
  public sum(handler: string | ((item: T, index: number, arr: T[]) => number)): this {
    this.operations.push(["sum", handler]);
    return this;
  }

  /**
   * @description
   * Obtiene el valor máximo de una clave.
   *
   * @param key - Clave del campo numérico
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.max('price')
   * ```
   */
  public max(key: string): this {
    this.operations.push(["max", key]);
    return this;
  }

  /**
   * @description
   * Obtiene el valor mínimo de una clave.
   *
   * @param key - Clave del campo numérico
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.min('price')
   * ```
   */
  public min(key: string): this {
    this.operations.push(["min", key]);
    return this;
  }

  /**
   * @description
   * Pagina los resultados.
   *
   * @param page - Número de página (1-indexed)
   * @param perPage - Elementos por página
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.paginate(1, 20) // Primera página, 20 elementos
   * ```
   */
  public paginate(page: number = 1, perPage: number = 20): this {
    this.operations.push(["paginate", page, perPage]);
    return this;
  }

  /**
   * @description
   * Actualiza elementos que coinciden con un criterio.
   *
   * @param where - Query object o función de filtrado (opcional)
   * @param set - Objeto con los campos a actualizar
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.update({ active: false }, { deletedAt: new Date() })
   * items.update({ deletedAt: new Date() }) // Actualiza todos
   * ```
   */
  public update(where: any, set?: any): this {
    this.operations.push(set === undefined ? ["update", where] : ["update", where, set]);
    return this;
  }

  /**
   * @description
   * Elimina elementos que coinciden con un criterio.
   *
   * @param where - Query object o función de filtrado
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.delete({ deleted: true })
   * ```
   */
  public delete(where: any): this {
    this.operations.push(["delete", where]);
    return this;
  }

  /**
   * @description
   * Elimina campos específicos de cada elemento.
   *
   * @param keys - Claves de los campos a eliminar
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.forget('password', 'token')
   * ```
   */
  public forget(...keys: string[] | string[][]): this {
    this.operations.push(["forget", ...keys]);
    return this;
  }

  /**
   * @description
   * Clona el contexto actual con items opcionales.
   * Util para crear nuevas instancias con el mismo executor.
   *
   * @param items - Items opcionales para la nueva colección
   * @returns this para encadenar
   */
  public collect(items?: T[]): this {
    this.operations.push(items === undefined ? ["collect"] : ["collect", items]);
    return this;
  }

  /**
   * @description
   * Imprime la colección en consola para debugging.
   *
   * @returns this para encadenar
   */
  public dump(): this {
    this.operations.push(["dump"]);
    return this;
  }

  /**
   * @description
   * Imprime la colección y termina el proceso (para debugging).
   *
   * @returns this para encadenar
   */
  public dd(): this {
    this.operations.push(["dd"]);
    return this;
  }

  /**
   * @description
   * Convierte la colección a JSON string.
   *
   * @param replacer - Función replacer de JSON.stringify
   * @param space - Espaciado para formato
   * @returns this para encadenar
   */
  public stringify(
    replacer?: (key: string, value: any) => any,
    space?: string | number
  ): this {
    this.operations.push(
      replacer === undefined
        ? ["stringify"]
        : space === undefined
        ? ["stringify", replacer]
        : ["stringify", replacer, space]
    );
    return this;
  }

  /**
   * @description
   * Registra un macro personalizado (extensión de método).
   *
   * @param key - Nombre del método personalizado
   * @param handler - Función del método personalizado
   * @returns this para encadenar
   *
   * @example
   * ```typescript
   * items.macro('active', function() {
   *   return this.where('status', 'active');
   * })
   * ```
   */
  public macro(key: string, handler: any): this {
    this.operations.push(["macro", key, handler]);
    return this;
  }
}
