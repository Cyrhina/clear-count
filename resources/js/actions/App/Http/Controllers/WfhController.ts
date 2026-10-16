import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WfhController::index
 * @see app/Http/Controllers/WfhController.php:28
 * @route '/api/wfh'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/wfh',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WfhController::index
 * @see app/Http/Controllers/WfhController.php:28
 * @route '/api/wfh'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WfhController::index
 * @see app/Http/Controllers/WfhController.php:28
 * @route '/api/wfh'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WfhController::index
 * @see app/Http/Controllers/WfhController.php:28
 * @route '/api/wfh'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WfhController::index
 * @see app/Http/Controllers/WfhController.php:28
 * @route '/api/wfh'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WfhController::index
 * @see app/Http/Controllers/WfhController.php:28
 * @route '/api/wfh'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WfhController::index
 * @see app/Http/Controllers/WfhController.php:28
 * @route '/api/wfh'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\WfhController::store
 * @see app/Http/Controllers/WfhController.php:98
 * @route '/api/wfh'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/wfh',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WfhController::store
 * @see app/Http/Controllers/WfhController.php:98
 * @route '/api/wfh'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WfhController::store
 * @see app/Http/Controllers/WfhController.php:98
 * @route '/api/wfh'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WfhController::store
 * @see app/Http/Controllers/WfhController.php:98
 * @route '/api/wfh'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WfhController::store
 * @see app/Http/Controllers/WfhController.php:98
 * @route '/api/wfh'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\WfhController::cancel
 * @see app/Http/Controllers/WfhController.php:144
 * @route '/api/wfh/cancel'
 */
export const cancel = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/api/wfh/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WfhController::cancel
 * @see app/Http/Controllers/WfhController.php:144
 * @route '/api/wfh/cancel'
 */
cancel.url = (options?: RouteQueryOptions) => {
    return cancel.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WfhController::cancel
 * @see app/Http/Controllers/WfhController.php:144
 * @route '/api/wfh/cancel'
 */
cancel.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WfhController::cancel
 * @see app/Http/Controllers/WfhController.php:144
 * @route '/api/wfh/cancel'
 */
    const cancelForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancel.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WfhController::cancel
 * @see app/Http/Controllers/WfhController.php:144
 * @route '/api/wfh/cancel'
 */
        cancelForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancel.url(options),
            method: 'post',
        })
    
    cancel.form = cancelForm
/**
* @see \App\Http\Controllers\WfhController::preview
 * @see app/Http/Controllers/WfhController.php:37
 * @route '/api/wfh/preview'
 */
export const preview = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(options),
    method: 'post',
})

preview.definition = {
    methods: ["post"],
    url: '/api/wfh/preview',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WfhController::preview
 * @see app/Http/Controllers/WfhController.php:37
 * @route '/api/wfh/preview'
 */
preview.url = (options?: RouteQueryOptions) => {
    return preview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WfhController::preview
 * @see app/Http/Controllers/WfhController.php:37
 * @route '/api/wfh/preview'
 */
preview.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WfhController::preview
 * @see app/Http/Controllers/WfhController.php:37
 * @route '/api/wfh/preview'
 */
    const previewForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: preview.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WfhController::preview
 * @see app/Http/Controllers/WfhController.php:37
 * @route '/api/wfh/preview'
 */
        previewForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: preview.url(options),
            method: 'post',
        })
    
    preview.form = previewForm
/**
* @see \App\Http\Controllers\WfhController::end
 * @see app/Http/Controllers/WfhController.php:157
 * @route '/api/wfh/end'
 */
export const end = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: end.url(options),
    method: 'post',
})

end.definition = {
    methods: ["post"],
    url: '/api/wfh/end',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WfhController::end
 * @see app/Http/Controllers/WfhController.php:157
 * @route '/api/wfh/end'
 */
end.url = (options?: RouteQueryOptions) => {
    return end.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WfhController::end
 * @see app/Http/Controllers/WfhController.php:157
 * @route '/api/wfh/end'
 */
end.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: end.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WfhController::end
 * @see app/Http/Controllers/WfhController.php:157
 * @route '/api/wfh/end'
 */
    const endForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: end.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WfhController::end
 * @see app/Http/Controllers/WfhController.php:157
 * @route '/api/wfh/end'
 */
        endForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: end.url(options),
            method: 'post',
        })
    
    end.form = endForm
/**
* @see \App\Http\Controllers\WfhController::decide
 * @see app/Http/Controllers/WfhController.php:173
 * @route '/api/wfh/decide'
 */
export const decide = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(options),
    method: 'post',
})

decide.definition = {
    methods: ["post"],
    url: '/api/wfh/decide',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WfhController::decide
 * @see app/Http/Controllers/WfhController.php:173
 * @route '/api/wfh/decide'
 */
decide.url = (options?: RouteQueryOptions) => {
    return decide.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WfhController::decide
 * @see app/Http/Controllers/WfhController.php:173
 * @route '/api/wfh/decide'
 */
decide.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WfhController::decide
 * @see app/Http/Controllers/WfhController.php:173
 * @route '/api/wfh/decide'
 */
    const decideForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: decide.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WfhController::decide
 * @see app/Http/Controllers/WfhController.php:173
 * @route '/api/wfh/decide'
 */
        decideForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: decide.url(options),
            method: 'post',
        })
    
    decide.form = decideForm
/**
* @see \App\Http\Controllers\WfhController::setLimit
 * @see app/Http/Controllers/WfhController.php:194
 * @route '/api/wfh/limit'
 */
export const setLimit = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: setLimit.url(options),
    method: 'put',
})

setLimit.definition = {
    methods: ["put"],
    url: '/api/wfh/limit',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\WfhController::setLimit
 * @see app/Http/Controllers/WfhController.php:194
 * @route '/api/wfh/limit'
 */
setLimit.url = (options?: RouteQueryOptions) => {
    return setLimit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WfhController::setLimit
 * @see app/Http/Controllers/WfhController.php:194
 * @route '/api/wfh/limit'
 */
setLimit.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: setLimit.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\WfhController::setLimit
 * @see app/Http/Controllers/WfhController.php:194
 * @route '/api/wfh/limit'
 */
    const setLimitForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setLimit.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WfhController::setLimit
 * @see app/Http/Controllers/WfhController.php:194
 * @route '/api/wfh/limit'
 */
        setLimitForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setLimit.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    setLimit.form = setLimitForm
const WfhController = { index, store, cancel, preview, end, decide, setLimit }

export default WfhController