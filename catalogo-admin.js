document.addEventListener('DOMContentLoaded', async () => {

    // =====================================================
    // WEBCORP BUSINESS
    // ADMINISTRACIÓN DEL CATÁLOGO
    // SUPABASE
    // =====================================================


    // =====================================================
    // CONFIGURACIÓN SUPABASE
    // =====================================================

    const SUPABASE_URL =
        'https://zoyplgxxbnjhvorgyrdq.supabase.co';

    const SUPABASE_PUBLISHABLE_KEY =
        'sb_publishable_JHpEeo8gwS5ov9eH6g3eJA_pp5K-TuN';

    const STORAGE_BUCKET =
        'catalogo-fotos';

    const SUPABASE_SCRIPT =
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';


    // =====================================================
    // CARGAR SUPABASE
    // =====================================================

    function cargarSupabase() {

        return new Promise((resolve, reject) => {

            if (
                window.supabase &&
                typeof window.supabase.createClient === 'function'
            ) {
                resolve();
                return;
            }

            const script =
                document.createElement('script');

            script.src =
                SUPABASE_SCRIPT;

            script.onload = () => {

                if (
                    window.supabase &&
                    typeof window.supabase.createClient === 'function'
                ) {
                    resolve();
                } else {
                    reject(
                        new Error(
                            'Supabase se cargó pero createClient no está disponible.'
                        )
                    );
                }
            };

            script.onerror = () => {

                reject(
                    new Error(
                        'No se pudo cargar la librería de Supabase.'
                    )
                );
            };

            document.head.appendChild(script);
        });
    }


    // =====================================================
    // INICIALIZAR SUPABASE
    // =====================================================

    try {

        await cargarSupabase();

    } catch (error) {

        console.error(
            'Error cargando Supabase:',
            error
        );

        alert(
            'No se pudo cargar Supabase. Revisa tu conexión a Internet.'
        );

        return;
    }


    // =====================================================
    // CLIENTE SUPABASE
    // =====================================================

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    console.log(
        'Supabase inicializado correctamente.'
    );

    console.log(
        'Proyecto:',
        SUPABASE_URL
    );


    // =====================================================
    // DATOS INICIALES
    // =====================================================

    const defaultProducts = [
        {
            id: 'prod-1',
            name: 'HONDRO MAX',
            code: 'HON-040',
            category: 'Articulaciones',

            proveedor: 'Everad',

            caracteristicas:
                'Producto para soporte articular|Fórmula avanzada|Uso diario',

            status: 'activo',

            description:
                'Fórmula avanzada para el soporte y movilidad articular diaria.',

            contraindications:
                'No consumir durante el embarazo o lactancia.',

            photos: [
                null,
                null,
                null,
                null,
                null,
                null
            ]
        },

        {
            id: 'prod-2',
            name: 'GASTRO BALANCE PRO',
            code: 'GAS-102',
            category: 'Digestivos',

            proveedor: 'NutraLabs',

            caracteristicas:
                'Complejo enzimático|Contiene probióticos|Apoyo digestivo',

            status: 'activo',

            description:
                'Complejo enzimático y probiótico para el bienestar digestivo.',

            contraindications:
                'Mantener fuera del alcance de los niños.',

            photos: [
                null,
                null,
                null,
                null,
                null,
                null
            ]
        },

        {
            id: 'prod-3',
            name: 'VITAL MEN PLUS',
            code: 'VIT-088',
            category: 'Masculino',

            proveedor: 'BioCorp',

            caracteristicas:
                'Contiene zinc|Extractos naturales|Fórmula energética',

            status: 'inactivo',

            description:
                'Suplemento energético con extractos naturales y zinc.',

            contraindications:
                'Consultar a su médico en caso de hipertensión.',

            photos: [
                null,
                null,
                null,
                null,
                null,
                null
            ]
        }
    ];


    // =====================================================
    // ESTADO
    // =====================================================

    let products = [];

    let currentModalPhotos = [
        null,
        null,
        null,
        null,
        null,
        null
    ];

    let currentModalPhotoPaths = [
        null,
        null,
        null,
        null,
        null,
        null
    ];

    let productIdToDelete = null;

    let toastTimeout = null;


    // =====================================================
    // REFERENCIAS DOM
    // =====================================================

    const tableBody =
        document.getElementById('productsTableBody');

    const searchInput =
        document.getElementById('searchInput');

    const statusFilter =
        document.getElementById('statusFilter');

    const tableCountBadge =
        document.getElementById('tableCountBadge');


    // =====================================================
    // KPI
    // =====================================================

    const statTotalProducts =
        document.getElementById('statTotalProducts');

    const statActiveProducts =
        document.getElementById('statActiveProducts');

    const statTotalPhotos =
        document.getElementById('statTotalPhotos');


    // =====================================================
    // MODAL PRODUCTO
    // =====================================================

    const productModal =
        document.getElementById('productModal');

    const productForm =
        document.getElementById('productForm');

    const modalTitle =
        document.getElementById('modalTitle');

    const prodIdInput =
        document.getElementById('productId');

    const prodNameInput =
        document.getElementById('prodName');

    const prodCodeInput =
        document.getElementById('prodCode');

    const prodCategoryInput =
        document.getElementById('prodCategory');

    const prodStatusInput =
        document.getElementById('prodStatus');


    // =====================================================
    // PROVEEDOR
    // =====================================================

    const prodProviderInput =
        document.getElementById('prodProvider');

    const providerPreviewText =
        document.getElementById('providerPreviewText');


    // =====================================================
    // CARACTERÍSTICAS
    // =====================================================

    const prodCharacteristicsInput =
        document.getElementById('prodCharacteristics');


    // =====================================================
    // DESCRIPCIÓN
    // =====================================================

    const prodDescriptionInput =
        document.getElementById('prodDescription');

    const prodContraindicationsInput =
        document.getElementById('prodContraindications');


    // =====================================================
    // FOTOS
    // =====================================================

    const photosGrid =
        document.getElementById('photosGrid');

    const photoCounterBadge =
        document.getElementById('photoCounterBadge');


    // =====================================================
    // MODAL ELIMINAR
    // =====================================================

    const deleteConfirmModal =
        document.getElementById('deleteConfirmModal');

    const deleteProductName =
        document.getElementById('deleteProductName');


    // =====================================================
    // VALIDAR ELEMENTOS HTML
    // =====================================================

    const elementosFaltantes = [];

    const elementos = {

        productsTableBody:
            tableBody,

        searchInput:
            searchInput,

        statusFilter:
            statusFilter,

        tableCountBadge:
            tableCountBadge,

        statTotalProducts:
            statTotalProducts,

        statActiveProducts:
            statActiveProducts,

        statTotalPhotos:
            statTotalPhotos,

        productModal:
            productModal,

        productForm:
            productForm,

        modalTitle:
            modalTitle,

        productId:
            prodIdInput,

        prodName:
            prodNameInput,

        prodCode:
            prodCodeInput,

        prodCategory:
            prodCategoryInput,

        prodStatus:
            prodStatusInput,

        prodProvider:
            prodProviderInput,

        providerPreviewText:
            providerPreviewText,

        prodCharacteristics:
            prodCharacteristicsInput,

        prodDescription:
            prodDescriptionInput,

        prodContraindications:
            prodContraindicationsInput,

        photosGrid:
            photosGrid,

        photoCounterBadge:
            photoCounterBadge,

        deleteConfirmModal:
            deleteConfirmModal,

        deleteProductName:
            deleteProductName
    };


    Object.keys(elementos).forEach(key => {

        if (!elementos[key]) {

            elementosFaltantes.push(key);
        }
    });


    if (elementosFaltantes.length > 0) {

        console.error(
            'Elementos HTML faltantes:',
            elementosFaltantes
        );

        alert(
            'El HTML no contiene algunos elementos necesarios para el catálogo.\n\n' +
            elementosFaltantes.join(', ')
        );

        return;
    }


    // =====================================================
    // COLORES CATEGORÍAS
    // =====================================================

    const categoryBadgeStyles = {

        'Bienestar':
            'bg-sky-50 text-sky-700 border-sky-200',

        'Digestivos':
            'bg-emerald-50 text-emerald-700 border-emerald-200',

        'Articulaciones':
            'bg-indigo-50 text-indigo-700 border-indigo-200',

        'Control':
            'bg-amber-50 text-amber-700 border-amber-200',

        'Urinario':
            'bg-cyan-50 text-cyan-700 border-cyan-200',

        'Masculino':
            'bg-violet-50 text-violet-700 border-violet-200',

        'Otros':
            'bg-slate-100 text-slate-700 border-slate-200'
    };


    // =====================================================
    // TOAST
    // =====================================================

    function showToast(
        message,
        type = 'success'
    ) {

        const toast =
            document.getElementById(
                'toastNotification'
            );

        const toastMsg =
            document.getElementById(
                'toastMessage'
            );

        const toastIcon =
            document.getElementById(
                'toastIcon'
            );


        if (!toast || !toastMsg) {

            console.log(
                `[${type}] ${message}`
            );

            return;
        }


        toastMsg.textContent =
            message;


        if (toastIcon) {

            if (type === 'danger') {

                toastIcon.className =
                    'fa-solid fa-circle-xmark text-rose-400';

            } else if (type === 'warning') {

                toastIcon.className =
                    'fa-solid fa-circle-exclamation text-amber-400';

            } else {

                toastIcon.className =
                    'fa-solid fa-circle-check text-emerald-400';
            }
        }


        toast.classList.remove(
            'translate-y-20',
            'opacity-0'
        );


        clearTimeout(
            toastTimeout
        );


        toastTimeout =
            setTimeout(() => {

                toast.classList.add(
                    'translate-y-20',
                    'opacity-0'
                );

            }, 3000);
    }


    // =====================================================
    // MOSTRAR ERROR SUPABASE
    // =====================================================

    function mostrarErrorSupabase(
        operacion,
        error,
        datos = null
    ) {

        console.error('');
        console.error('======================================');
        console.error(`ERROR SUPABASE - ${operacion}`);
        console.error('======================================');

        console.error(
            'Código:',
            error?.code || 'N/D'
        );

        console.error(
            'Mensaje:',
            error?.message || 'Sin mensaje'
        );

        console.error(
            'Detalles:',
            error?.details || 'Sin detalles'
        );

        console.error(
            'Hint:',
            error?.hint || 'Sin hint'
        );

        console.error(
            'Objeto completo:',
            error
        );

        if (datos) {

            console.error(
                'Datos enviados:',
                datos
            );
        }

        console.error('======================================');
        console.error('');

        let mensaje =
            error?.message ||
            'Error desconocido de Supabase.';


        if (
            error?.code === '42501'
        ) {

            mensaje =
                'Supabase rechazó la operación por permisos o RLS.';
        }


        if (
            error?.code === '42703' ||
            /column.*does not exist/i.test(
                mensaje
            ) ||
            /could not find.*column/i.test(
                mensaje
            )
        ) {

            mensaje =
                'Supabase no reconoce una columna. Verifica proveedor y caracteristicas en la tabla.';
        }


        if (
            error?.code === '23505'
        ) {

            mensaje =
                'Ya existe un producto con un valor que debe ser único.';
        }


        if (
            error?.code === '23502'
        ) {

            mensaje =
                'Falta un campo obligatorio en la tabla de Supabase.';
        }


        showToast(
            `No se pudo guardar: ${mensaje}`,
            'danger'
        );
    }


    // =====================================================
    // NORMALIZAR FOTOS
    // =====================================================

    function normalizarFotos(
        fotos
    ) {

        const resultado = [
            null,
            null,
            null,
            null,
            null,
            null
        ];


        if (!Array.isArray(fotos)) {

            return resultado;
        }


        fotos.forEach(
            (foto, index) => {

                if (index >= 6) {

                    return;
                }


                if (
                    typeof foto === 'string' &&
                    foto.trim() !== ''
                ) {

                    resultado[index] = {

                        url:
                            foto,

                        path:
                            null
                    };

                    return;
                }


                if (
                    foto &&
                    typeof foto === 'object'
                ) {

                    resultado[index] = {

                        url:
                            foto.url ||
                            null,

                        path:
                            foto.path ||
                            null
                    };
                }
            }
        );


        return resultado;
    }


    // =====================================================
    // FOTOS PARA UI
    // =====================================================

    function fotosParaUI(
        fotos
    ) {

        return normalizarFotos(
            fotos
        ).map(
            foto =>
                foto
                    ? foto.url
                    : null
        );
    }


    // =====================================================
    // FOTOS PARA DB
    // =====================================================

    function fotosParaDB() {

        return currentModalPhotos.map(
            (url, index) => {

                if (!url) {

                    return null;
                }


                return {

                    url:
                        url,

                    path:
                        currentModalPhotoPaths[index] ||
                        null
                };
            }
        );
    }


    // =====================================================
    // UUID
    // =====================================================

    function generarIdArchivo() {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID === 'function'
        ) {

            return window.crypto.randomUUID();
        }


        return (
            Date.now().toString(36) +
            '-' +
            Math.random()
                .toString(36)
                .substring(2, 12)
        );
    }


    // =====================================================
    // CARGAR PRODUCTOS
    // =====================================================

    async function loadProducts() {

        try {

            console.log(
                'Cargando productos desde Supabase...'
            );


            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        'catalogo_productos'
                    )
                    .select('*')
                    .order(
                        'creado_en',
                        {
                            ascending: false
                        }
                    );


            if (error) {

                mostrarErrorSupabase(
                    'CARGAR PRODUCTOS',
                    error
                );

                throw error;
            }


            products =
                (data || []).map(
                    prod => {

                        return {

                            id:
                                prod.id,

                            name:
                                prod.nombre ||
                                '',

                            code:
                                prod.codigo ||
                                '',

                            category:
                                prod.categoria ||
                                'Otros',

                            status:
                                prod.activo
                                    ? 'activo'
                                    : 'inactivo',

                            proveedor:
                                prod.proveedor ||
                                prod.tag ||
                                '',

                            caracteristicas:
                                prod.caracteristicas ||
                                '',

                            description:
                                prod.descripcion ||
                                '',

                            contraindications:
                                prod.contraindicaciones ||
                                '',

                            photos:
                                fotosParaUI(
                                    prod.fotos
                                )
                        };
                    }
                );


            renderTable();


            console.log(
                `Supabase conectado. ${products.length} productos cargados.`
            );

        } catch (error) {

            console.error(
                'ERROR CARGANDO PRODUCTOS:',
                error
            );
        }
    }


    // =====================================================
    // SUBIR FOTO
    // =====================================================

    async function uploadPhoto(
        file
    ) {

        if (!file) {

            return null;
        }


        if (
            !file.type.startsWith('image/')
        ) {

            throw new Error(
                'El archivo seleccionado no es una imagen.'
            );
        }


        if (
            file.size > 5 * 1024 * 1024
        ) {

            throw new Error(
                'La imagen no puede superar los 5 MB.'
            );
        }


        const extension =
            file.name
                .split('.')
                .pop()
                .toLowerCase();


        const filename =
            `${generarIdArchivo()}.${extension}`;


        const path =
            `productos/${filename}`;


        console.log(
            'Subiendo fotografía:',
            path
        );


        const {
            error
        } =
            await supabaseClient
                .storage
                .from(STORAGE_BUCKET)
                .upload(
                    path,
                    file,
                    {
                        cacheControl:
                            '3600',

                        upsert:
                            false,

                        contentType:
                            file.type
                    }
                );


        if (error) {

            console.error(
                'Error Storage:',
                error
            );

            throw error;
        }


        const {
            data
        } =
            supabaseClient
                .storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(path);


        if (
            !data ||
            !data.publicUrl
        ) {

            throw new Error(
                'La fotografía se subió, pero no se pudo obtener su URL pública.'
            );
        }


        return {

            url:
                data.publicUrl,

            path:
                path
        };
    }


    // =====================================================
    // ELIMINAR FOTO STORAGE
    // =====================================================

    async function removePhoto(
        path
    ) {

        if (!path) {

            return;
        }


        try {

            const {
                error
            } =
                await supabaseClient
                    .storage
                    .from(STORAGE_BUCKET)
                    .remove([
                        path
                    ]);


            if (error) {

                console.error(
                    'Error eliminando foto:',
                    error
                );

            } else {

                console.log(
                    'Foto eliminada:',
                    path
                );
            }

        } catch (error) {

            console.error(
                'Error eliminando archivo:',
                error
            );
        }
    }


    // =====================================================
    // ESTADÍSTICAS
    // =====================================================

    function updateStats() {

        const total =
            products.length;


        const active =
            products.filter(
                p =>
                    p.status === 'activo'
            ).length;


        const totalPhotos =
            products.reduce(
                (
                    acc,
                    prod
                ) => {

                    return (
                        acc +
                        (
                            prod.photos ||
                            []
                        ).filter(
                            Boolean
                        ).length
                    );

                },
                0
            );


        statTotalProducts.textContent =
            total;

        statActiveProducts.textContent =
            active;

        statTotalPhotos.textContent =
            totalPhotos;
    }


    // =====================================================
    // ESCAPAR HTML
    // =====================================================

    function escapeHtml(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return '';
        }


        return String(value)
            .replace(
                /&/g,
                '&amp;'
            )
            .replace(
                /</g,
                '&lt;'
            )
            .replace(
                />/g,
                '&gt;'
            )
            .replace(
                /"/g,
                '&quot;'
            )
            .replace(
                /'/g,
                '&#039;'
            );
    }


    // =====================================================
    // RENDERIZAR TABLA
    // =====================================================

    function renderTable() {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();


        const statusVal =
            statusFilter.value;


        const filtered =
            products.filter(
                prod => {

                    const texto =
                        [
                            prod.name,
                            prod.code,
                            prod.category,
                            prod.proveedor,
                            prod.caracteristicas
                        ]
                            .filter(Boolean)
                            .join(' ')
                            .toLowerCase();


                    const matchesText =
                        texto.includes(
                            query
                        );


                    const matchesStatus =
                        statusVal === '' ||
                        prod.status === statusVal;


                    return (
                        matchesText &&
                        matchesStatus
                    );
                }
            );


        tableCountBadge.textContent =
            `${filtered.length} ${
                filtered.length === 1
                    ? 'producto'
                    : 'productos'
            }`;


        tableBody.innerHTML =
            '';


        if (
            filtered.length === 0
        ) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="py-12 px-6 text-center">

                        <div
                            class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-3">

                            <i class="fa-solid fa-box-open"></i>

                        </div>

                        <p
                            class="font-display font-bold text-slate-700 text-base">

                            No se encontraron productos

                        </p>

                        <p
                            class="text-xs text-slate-500 mt-1">

                            Intenta ajustar los filtros de búsqueda o registra un nuevo producto.

                        </p>

                    </td>

                </tr>
            `;


            updateStats();

            return;
        }


        filtered.forEach(
            prod => {

                const firstPhoto =
                    (
                        prod.photos ||
                        []
                    ).find(Boolean);


                const photoCount =
                    (
                        prod.photos ||
                        []
                    ).filter(Boolean).length;


                const catStyle =
                    categoryBadgeStyles[
                        prod.category
                    ] ||
                    categoryBadgeStyles[
                        'Otros'
                    ];


                const isActive =
                    prod.status === 'activo';


                const statusBadge =
                    isActive

                        ? `

                            <span
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">

                                <span
                                    class="w-1.5 h-1.5 rounded-full bg-emerald-500">
                                </span>

                                Activo

                            </span>

                          `

                        : `

                            <span
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">

                                <span
                                    class="w-1.5 h-1.5 rounded-full bg-slate-400">
                                </span>

                                Inactivo

                            </span>

                          `;


                const thumbnailHtml =
                    firstPhoto

                        ? `

                            <div
                                class="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50">

                                <img
                                    src="${escapeHtml(firstPhoto)}"
                                    alt="${escapeHtml(prod.name)}"
                                    class="w-full h-full object-cover"
                                    onerror="this.src='https://placehold.co/100x100/e2e8f0/64748b?text=IMG'">

                                ${
                                    photoCount > 1
                                        ? `

                                            <span
                                                class="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-md">

                                                +${photoCount - 1}

                                            </span>

                                          `
                                        : ''
                                }

                            </div>

                          `

                        : `

                            <div
                                class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">

                                <i class="fa-solid fa-image text-lg"></i>

                            </div>

                          `;


                const tr =
                    document.createElement('tr');


                tr.className =
                    'hover:bg-slate-50/90 transition-colors group';


                tr.innerHTML = `

                    <td class="py-3.5 px-6">

                        <div class="flex items-center gap-3.5">

                            ${thumbnailHtml}

                            <div>

                                <div
                                    class="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">

                                    ${escapeHtml(prod.name)}

                                </div>

                                <div
                                    class="text-xs font-mono font-medium text-slate-500 mt-0.5">

                                    ${escapeHtml(prod.code)}

                                </div>

                            </div>

                        </div>

                    </td>


                    <td class="py-3.5 px-4">

                        <span
                            class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${catStyle}">

                            ${escapeHtml(prod.category)}

                        </span>

                    </td>


                    <td class="py-3.5 px-4">

                        <span
                            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">

                            <i
                                class="fa-solid fa-building text-indigo-500 text-[10px]">
                            </i>

                            ${escapeHtml(
                                prod.proveedor ||
                                'Sin proveedor'
                            )}

                        </span>

                    </td>


                    <td class="py-3.5 px-4">

                        ${statusBadge}

                    </td>


                    <td class="py-3.5 px-6 text-right">

                        <div
                            class="inline-flex items-center justify-end gap-1.5">

                            <button
                                type="button"
                                data-edit="${escapeHtml(prod.id)}"
                                title="Editar producto"
                                class="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer">

                                <i
                                    class="fa-solid fa-pen text-xs pointer-events-none">
                                </i>

                            </button>


                            <button
                                type="button"
                                data-delete="${escapeHtml(prod.id)}"
                                title="Eliminar producto"
                                class="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer">

                                <i
                                    class="fa-solid fa-trash text-xs pointer-events-none">
                                </i>

                            </button>

                        </div>

                    </td>

                `;


                tableBody.appendChild(tr);
            }
        );


        updateStats();
    }


    // =====================================================
    // RENDERIZAR FOTOS
    // =====================================================

    function renderModalPhotos() {

        photosGrid.innerHTML =
            '';


        const loadedCount =
            currentModalPhotos
                .filter(Boolean)
                .length;


        photoCounterBadge.textContent =
            `${loadedCount} / 6 fotos`;


        for (
            let i = 0;
            i < 6;
            i++
        ) {

            const photoUrl =
                currentModalPhotos[i];


            const box =
                document.createElement('div');


            box.className =
                'relative aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all overflow-hidden group';


            if (photoUrl) {

                box.classList.remove(
                    'border-dashed',
                    'border-slate-300'
                );


                box.classList.add(
                    'border-solid',
                    'border-indigo-200'
                );


                box.innerHTML = `

                    <img
                        src="${escapeHtml(photoUrl)}"
                        alt="Foto ${i + 1}"
                        class="w-full h-full object-cover">

                    <span
                        class="absolute bottom-1.5 left-1.5 bg-slate-900/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">

                        FOTO ${i + 1}

                    </span>


                    <button
                        type="button"
                        data-remove-photo="${i}"
                        title="Quitar foto"
                        class="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer">

                        <i
                            class="fa-solid fa-xmark text-xs pointer-events-none">
                        </i>

                    </button>

                `;

            } else {

                box.innerHTML = `

                    <label
                        class="w-full h-full flex flex-col items-center justify-center cursor-pointer p-2 text-center">

                        <input
                            type="file"
                            accept="image/*"
                            data-photo-index="${i}"
                            class="hidden">

                        <div
                            class="w-9 h-9 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all mb-1.5">

                            <i
                                class="fa-solid fa-camera text-sm">
                            </i>

                        </div>

                        <span
                            class="text-[11px] font-bold tracking-wide text-slate-500 group-hover:text-indigo-700">

                            FOTO ${i + 1}

                        </span>

                        <span
                            class="text-[10px] text-slate-400 mt-0.5">

                            Subir imagen

                        </span>

                    </label>

                `;
            }


            photosGrid.appendChild(box);
        }
    }


    // =====================================================
    // NUEVO PRODUCTO
    // =====================================================

    function openNewModal() {

        modalTitle.textContent =
            'Nuevo Producto';


        productForm.reset();


        prodIdInput.value =
            '';


        providerPreviewText.textContent =
            'Proveedor';


        currentModalPhotos = [
            null,
            null,
            null,
            null,
            null,
            null
        ];


        currentModalPhotoPaths = [
            null,
            null,
            null,
            null,
            null,
            null
        ];


        renderModalPhotos();


        productModal.classList.remove(
            'hidden'
        );


        setTimeout(() => {

            prodNameInput.focus();

        }, 50);
    }


    // =====================================================
    // EDITAR PRODUCTO
    // =====================================================

    async function openEditModal(id) {

        const prod =
            products.find(
                p =>
                    String(p.id) ===
                    String(id)
            );


        if (!prod) {

            return;
        }


        modalTitle.textContent =
            'Editar Producto';


        prodIdInput.value =
            prod.id;


        prodNameInput.value =
            prod.name;


        prodCodeInput.value =
            prod.code;


        prodCategoryInput.value =
            prod.category;


        prodStatusInput.value =
            prod.status;


        prodProviderInput.value =
            prod.proveedor || '';


        providerPreviewText.textContent =
            prod.proveedor ||
            'Proveedor';


        prodCharacteristicsInput.value =
            prod.caracteristicas || '';


        prodDescriptionInput.value =
            prod.description || '';


        prodContraindicationsInput.value =
            prod.contraindications || '';


        currentModalPhotos = [
            null,
            null,
            null,
            null,
            null,
            null
        ];


        currentModalPhotoPaths = [
            null,
            null,
            null,
            null,
            null,
            null
        ];


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from('catalogo_productos')
                    .select('fotos')
                    .eq('id', id)
                    .single();


            if (error) {

                mostrarErrorSupabase(
                    'CARGAR FOTOS',
                    error
                );

                throw error;
            }


            const fotos =
                normalizarFotos(
                    data?.fotos
                );


            fotos.forEach(
                (foto, index) => {

                    if (!foto) {

                        return;
                    }


                    currentModalPhotos[index] =
                        foto.url;


                    currentModalPhotoPaths[index] =
                        foto.path;
                }
            );

        } catch (error) {

            console.error(
                'Error cargando fotografías:',
                error
            );
        }


        renderModalPhotos();


        productModal.classList.remove(
            'hidden'
        );
    }


    // =====================================================
    // CERRAR MODAL
    // =====================================================

    function closeProductModal() {

        productModal.classList.add(
            'hidden'
        );
    }


    // =====================================================
    // BOTONES MODAL
    // =====================================================

    const btnOpenNewModal =
        document.getElementById(
            'btnOpenNewModal'
        );

    const btnCloseModal =
        document.getElementById(
            'btnCloseModal'
        );

    const btnCancelModal =
        document.getElementById(
            'btnCancelModal'
        );


    if (btnOpenNewModal) {

        btnOpenNewModal.addEventListener(
            'click',
            openNewModal
        );
    }


    if (btnCloseModal) {

        btnCloseModal.addEventListener(
            'click',
            closeProductModal
        );
    }


    if (btnCancelModal) {

        btnCancelModal.addEventListener(
            'click',
            closeProductModal
        );
    }


    productModal.addEventListener(
        'click',
        e => {

            if (
                e.target === productModal
            ) {

                closeProductModal();
            }
        }
    );


    // =====================================================
    // PROVEEDOR
    // =====================================================

    prodProviderInput.addEventListener(
        'input',
        e => {

            providerPreviewText.textContent =
                e.target.value.trim() ||
                'Proveedor';
        }
    );


    // =====================================================
    // SELECCIONAR FOTO
    // =====================================================

    photosGrid.addEventListener(
        'change',
        async e => {

            if (
                !e.target.matches(
                    'input[type="file"]'
                )
            ) {

                return;
            }


            const index =
                parseInt(
                    e.target.dataset.photoIndex,
                    10
                );


            const file =
                e.target.files[0];


            if (!file) {

                return;
            }


            try {

                showToast(
                    'Subiendo fotografía...',
                    'warning'
                );


                const resultado =
                    await uploadPhoto(file);


                if (!resultado) {

                    throw new Error(
                        'No se recibió información de la fotografía.'
                    );
                }


                currentModalPhotos[index] =
                    resultado.url;


                currentModalPhotoPaths[index] =
                    resultado.path;


                renderModalPhotos();


                showToast(
                    'Fotografía subida correctamente.'
                );

            } catch (error) {

                console.error(
                    'ERROR SUBIENDO FOTO:',
                    error
                );


                showToast(
                    `No se pudo subir la fotografía: ${
                        error.message ||
                        'Error desconocido'
                    }`,
                    'danger'
                );
            }
        }
    );


    // =====================================================
    // QUITAR FOTO
    // =====================================================

    photosGrid.addEventListener(
        'click',
        async e => {

            const removeBtn =
                e.target.closest(
                    '[data-remove-photo]'
                );


            if (!removeBtn) {

                return;
            }


            const index =
                parseInt(
                    removeBtn.dataset.removePhoto,
                    10
                );


            const path =
                currentModalPhotoPaths[index];


            if (path) {

                await removePhoto(path);
            }


            currentModalPhotos[index] =
                null;


            currentModalPhotoPaths[index] =
                null;


            renderModalPhotos();


            showToast(
                'Fotografía eliminada.'
            );
        }
    );


    // =====================================================
    // GUARDAR PRODUCTO
    // =====================================================

    productForm.addEventListener(
        'submit',
        async e => {

            e.preventDefault();


            const id =
                prodIdInput.value.trim();


            const nombre =
                prodNameInput.value.trim();


            const codigo =
                prodCodeInput.value
                    .trim()
                    .toUpperCase();


            const categoria =
                prodCategoryInput.value.trim();


            const proveedor =
                prodProviderInput.value.trim();


            const caracteristicas =
                prodCharacteristicsInput.value.trim();


            const descripcion =
                prodDescriptionInput.value.trim();


            const contraindicaciones =
                prodContraindicationsInput.value.trim();


            // =========================================
            // VALIDACIONES
            // =========================================

            if (!nombre) {

                showToast(
                    'El nombre del producto es obligatorio.',
                    'danger'
                );

                prodNameInput.focus();

                return;
            }


            if (!codigo) {

                showToast(
                    'El código del producto es obligatorio.',
                    'danger'
                );

                prodCodeInput.focus();

                return;
            }


            if (!categoria) {

                showToast(
                    'Selecciona una categoría.',
                    'danger'
                );

                prodCategoryInput.focus();

                return;
            }


            if (!proveedor) {

                showToast(
                    'El proveedor / responsable es obligatorio.',
                    'danger'
                );

                prodProviderInput.focus();

                return;
            }


            // =========================================
            // OBJETO PARA SUPABASE
            // =========================================

            const productData = {

                nombre:
                    nombre,

                codigo:
                    codigo,

                categoria:
                    categoria,

                activo:
                    prodStatusInput.value === 'activo',

                proveedor:
                    proveedor,

                caracteristicas:
                    caracteristicas,

                descripcion:
                    descripcion,

                contraindicaciones:
                    contraindicaciones,

                fotos:
                    fotosParaDB(),

                actualizado_en:
                    new Date().toISOString()
            };


            console.log('');
            console.log('======================================');
            console.log('DATOS QUE SE ENVIARÁN A SUPABASE');
            console.log('======================================');
            console.log(
                JSON.stringify(
                    productData,
                    null,
                    2
                )
            );
            console.log('======================================');


            try {

                // =========================================
                // EDITAR
                // =========================================

                if (id) {

                    console.log(
                        'Actualizando producto:',
                        id
                    );


                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from('catalogo_productos')
                            .update(productData)
                            .eq('id', id)
                            .select()
                            .single();


                    if (error) {

                        mostrarErrorSupabase(
                            'UPDATE PRODUCTO',
                            error,
                            productData
                        );

                        throw error;
                    }


                    console.log(
                        'Producto actualizado correctamente:',
                        data
                    );


                    showToast(
                        'Producto actualizado correctamente.'
                    );

                }

                // =========================================
                // NUEVO
                // =========================================

                else {

                    console.log(
                        'Insertando producto...'
                    );


                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from('catalogo_productos')
                            .insert(productData)
                            .select()
                            .single();


                    if (error) {

                        mostrarErrorSupabase(
                            'INSERT PRODUCTO',
                            error,
                            productData
                        );

                        throw error;
                    }


                    console.log(
                        '======================================'
                    );

                    console.log(
                        'PRODUCTO CREADO CORRECTAMENTE'
                    );

                    console.log(
                        data
                    );

                    console.log(
                        '======================================'
                    );


                    showToast(
                        'Producto agregado al catálogo.'
                    );
                }


                // =========================================
                // RECARGAR DESDE SUPABASE
                // =========================================

                await loadProducts();


                closeProductModal();

            } catch (error) {

                console.error('');
                console.error(
                    '======================================'
                );

                console.error(
                    'ERROR GUARDANDO PRODUCTO'
                );

                console.error(
                    '======================================'
                );

                console.error(
                    'Código:',
                    error?.code
                );

                console.error(
                    'Mensaje:',
                    error?.message
                );

                console.error(
                    'Detalles:',
                    error?.details
                );

                console.error(
                    'Hint:',
                    error?.hint
                );

                console.error(
                    'Objeto completo:',
                    error
                );

                console.error(
                    '======================================'
                );

                /*
                 * No cerramos el modal aquí.
                 *
                 * Si Supabase rechaza el INSERT/UPDATE,
                 * el usuario puede corregir los datos
                 * y volver a guardar.
                 */
            }
        }
    );


    // =====================================================
    // DELEGACIÓN TABLA
    // =====================================================

    tableBody.addEventListener(
        'click',
        e => {

            const editBtn =
                e.target.closest(
                    '[data-edit]'
                );


            if (editBtn) {

                openEditModal(
                    editBtn.dataset.edit
                );

                return;
            }


            const deleteBtn =
                e.target.closest(
                    '[data-delete]'
                );


            if (deleteBtn) {

                const id =
                    deleteBtn.dataset.delete;


                const prod =
                    products.find(
                        p =>
                            String(p.id) ===
                            String(id)
                    );


                if (prod) {

                    productIdToDelete =
                        id;


                    deleteProductName.textContent =
                        `${prod.name} (${prod.code})`;


                    deleteConfirmModal.classList.remove(
                        'hidden'
                    );
                }
            }
        }
    );


    // =====================================================
    // CANCELAR ELIMINACIÓN
    // =====================================================

    const btnCancelDelete =
        document.getElementById(
            'btnCancelDelete'
        );


    if (btnCancelDelete) {

        btnCancelDelete.addEventListener(
            'click',
            () => {

                productIdToDelete =
                    null;

                deleteConfirmModal.classList.add(
                    'hidden'
                );
            }
        );
    }


    // =====================================================
    // CONFIRMAR ELIMINACIÓN
    // =====================================================

    const btnConfirmDelete =
        document.getElementById(
            'btnConfirmDelete'
        );


    if (btnConfirmDelete) {

        btnConfirmDelete.addEventListener(
            'click',
            async () => {

                if (!productIdToDelete) {

                    return;
                }


                const id =
                    productIdToDelete;


                try {

                    showToast(
                        'Eliminando producto...',
                        'warning'
                    );


                    // =====================================
                    // OBTENER FOTOS
                    // =====================================

                    const {
                        data: product,
                        error: fetchError
                    } =
                        await supabaseClient
                            .from('catalogo_productos')
                            .select('fotos')
                            .eq('id', id)
                            .single();


                    if (fetchError) {

                        mostrarErrorSupabase(
                            'OBTENER PRODUCTO PARA ELIMINAR',
                            fetchError
                        );

                        throw fetchError;
                    }


                    // =====================================
                    // ELIMINAR FOTOS STORAGE
                    // =====================================

                    const paths =
                        normalizarFotos(
                            product?.fotos
                        )
                            .map(
                                foto =>
                                    foto?.path
                            )
                            .filter(Boolean);


                    if (paths.length > 0) {

                        const {
                            error: storageError
                        } =
                            await supabaseClient
                                .storage
                                .from(STORAGE_BUCKET)
                                .remove(paths);


                        if (storageError) {

                            console.error(
                                'Error eliminando fotos:',
                                storageError
                            );
                        }
                    }


                    // =====================================
                    // ELIMINAR PRODUCTO
                    // =====================================

                    const {
                        error
                    } =
                        await supabaseClient
                            .from('catalogo_productos')
                            .delete()
                            .eq('id', id);


                    if (error) {

                        mostrarErrorSupabase(
                            'DELETE PRODUCTO',
                            error
                        );

                        throw error;
                    }


                    products =
                        products.filter(
                            p =>
                                String(p.id) !==
                                String(id)
                        );


                    renderTable();


                    showToast(
                        'Producto eliminado del catálogo.',
                        'danger'
                    );

                } catch (error) {

                    console.error(
                        'ERROR ELIMINANDO PRODUCTO:',
                        error
                    );

                } finally {

                    productIdToDelete =
                        null;

                    deleteConfirmModal.classList.add(
                        'hidden'
                    );
                }
            }
        );
    }


    // =====================================================
    // FILTROS
    // =====================================================

    searchInput.addEventListener(
        'input',
        renderTable
    );


    statusFilter.addEventListener(
        'change',
        renderTable
    );


    // =====================================================
    // BOTÓN VOLVER
    // =====================================================

    const btnBack =
        document.getElementById(
            'btnBack'
        );


    if (btnBack) {

        btnBack.addEventListener(
            'click',
            () => {

                showToast(
                    'Volviendo al panel principal de Webcorp Business...',
                    'warning'
                );
            }
        );
    }


    // =====================================================
    // INICIALIZAR
    // =====================================================

    console.log(
        '======================================'
    );

    console.log(
        'WEBCORP BUSINESS - CATÁLOGO'
    );

    console.log(
        'Inicializando conexión con Supabase...'
    );

    console.log(
        '======================================'
    );


    await loadProducts();

});