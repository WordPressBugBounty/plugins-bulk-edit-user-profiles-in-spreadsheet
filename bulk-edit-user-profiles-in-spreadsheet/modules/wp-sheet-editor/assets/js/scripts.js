function vgseHooks(){
	if(!window.vgseHooksStore){
		window.vgseHooksStore = wp.hooks.createHooks();
	}
	return window.vgseHooksStore;
}
function vgseStripHtml(html) {
	var doc = new DOMParser().parseFromString(html, 'text/html');
	return doc.body.textContent || "";
}
function vgseRange(start, end) {
	var ans = [];
	for (var i = start; i <= end; i++) {
		ans.push(i);
	}
	return ans;
}
function vgseIsInViewport($element) {
	var elementTop = $element.offset().top;
	var elementBottom = elementTop + $element.outerHeight();

	var viewportTop = jQuery(window).scrollTop();
	var viewportBottom = viewportTop + jQuery(window).height();

	return elementTop > viewportTop && elementTop < viewportBottom;
}
function vgseCountMatchingElements(arrayA, arrayB) {
	var matches = 0;
	for (i = 0; i < arrayA.length; i++) {
		if (arrayB.indexOf(arrayA[i]) != -1) {
			matches++;
		}
	}
	return matches;
}
function vgseGetPostTypeColumnsOptions(filters, formulaFormat, string, just_data) {
	var out = just_data ? {} : [];
	if (typeof vgse_editor_settings === 'undefined') {
		return out;
	}
	jQuery.each(vgse_editor_settings.final_spreadsheet_columns_settings, function (key, column) {
		if (vgse_editor_settings.exclude_non_visible_columns_from_tools && typeof vgse_editor_settings.columnsFormat[key] === 'undefined') {
			return true;
		}
		var matchesAllFilters = true;
		for (var filterKey in filters) {
			if (Object.hasOwnProperty.call(filters, filterKey) && filters[filterKey] !== column[filterKey]) {
				matchesAllFilters = false;
				break;
			}
		}
		if (matchesAllFilters) {
			var text = formulaFormat ? column.title + ' ($' + key + '$)' : column.title;
			var optionValue = formulaFormat ? '$' + key + '$' : key;
			if (just_data) {
				out[optionValue] = text;
			} else {
				var $option = jQuery('<option />').attr({
					value: optionValue,
					'data-value-type': column.value_type || 'text'
				}).text(text);
				out.push($option.prop('outerHTML'));
			}
		}
	});

	if (string) {
		return out.join('');
	} else {
		return out;
	}

}
function vgseEscapeHTML(str) {
	var map = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;" // ' -> &apos; for XML only
	};
	return str.replace(/[&<>"']/g, function (m) {
		return map[m];
	});
}
function vgseToggleFullScreen(isActive) {
	if (typeof isActive !== 'number') {
		var isActive = jQuery('.wpse-full-screen-notice-content.notice-on').css('display') === 'block' || jQuery(window).scrollLeft() > jQuery('#adminmenuwrap').width();
	}
	if (isActive) {
		jQuery('.wpse-full-screen-notice-content.notice-on').hide();
		jQuery('.wpse-full-screen-notice-content.notice-off').show();
		jQuery('html').removeClass('wpse-full-screen');
		jQuery('html,body').scrollTop(0);
		jQuery('html,body').scrollLeft(0);
		window.wpseFullScreenActive = false;
	} else {
		jQuery('.wpse-full-screen-notice-content.notice-on').show();
		jQuery('.wpse-full-screen-notice-content.notice-off').hide();
		jQuery('html').addClass('wpse-full-screen');
		window.wpseFullScreenActive = true;
	}
}
function vgseFormatDate() {
	var d = new Date(),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2)
		month = '0' + month;
	if (day.length < 2)
		day = '0' + day;

	return [year, month, day].join('-');
}
function vgseGuidGenerator() {
	var S4 = function () {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function vgseCustomTooltip($element, text, position, multipleTimes, type) {
	if (!position) {
		position = 'down';
	}
	$element.attr({
		'data-wpse-tooltip': position,
		'aria-label': text,
		'data-wpse-visible': 1,
		'data-wpse-tooltip-type': type
	});

	$element.on('hover', function () {
		$element.removeAttr('data-wpse-visible');
	});

	setTimeout(function () {
		if (!multipleTimes) {
			$element.removeAttr('data-wpse-tooltip');
		}
		$element.removeAttr('data-wpse-visible');
	}, 8000);
}

function vgseCleanObject(obj) {
	for (var propName in obj) {
		if (!obj[propName] || (Array.isArray(obj[propName]) && !vgseUniqueArray(obj[propName]).length)) {
			delete obj[propName];
		}
	}

	// Unset the products_operator filter when the products filter is missing, because they're both connected
	if(obj.products_operator && (!obj.products || !obj.products.length)){
		delete obj.products_operator;
	}
}

/**
 * Turn query string into object
 * @param str query
 * @returns obj
 */
function beParseParamsOld(query) {
	var query_string = {};
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		pair[0] = decodeURIComponent(pair[0]);
		// We don't decode the pair[1] because we'll send the value to the server encoded
		// The decoding and encoding causes issues with the + and spaces

		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined" || !vgseEndsWith(pair[0], '[]')) {
			query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string" && vgseEndsWith(pair[0], '[]')) {
			var arr = [query_string[pair[0]], pair[1]];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	}
	return query_string;
}
function beParseParams(query) {

	query = query.substring(query.indexOf('?') + 1);

	var re = /([^&=]+)=?([^&]*)/g;
	var decodeRE = /\+/g;

	var decode = function (str) {
		return decodeURIComponent(str.replace(decodeRE, " "));
	};

	var params = {}, e;
	while (e = re.exec(query)) {
		var k = decode(e[1]), v = decode(e[2]);
		if (k.substring(k.length - 2) === '[]') {
			k = k.substring(0, k.length - 2);
			(params[k] || (params[k] = [])).push(v);
		}
		else params[k] = v;
	}

	var assign = function (obj, keyPath, value) {
		var lastKeyIndex = keyPath.length - 1;
		for (var i = 0; i < lastKeyIndex; ++i) {
			var key = keyPath[i];
			if (!(key in obj))
				obj[key] = {}
			obj = obj[key];
		}
		obj[keyPath[lastKeyIndex]] = value;
	}

	for (var prop in params) {
		var structure = prop.split('[');
		if (structure.length > 1) {
			var levels = [];
			structure.forEach(function (item, i) {
				var key = item.replace(/[?[\]\\ ]/g, '');
				levels.push(key);
			});
			assign(params, levels, params[prop]);
			delete (params[prop]);
		}
	}
	return params;
};

/**
 * Get rows filters
 * @returns str Filters as query string
 */
function beGetRowsFilters() {
	return (jQuery('body').data('be-filters')) ? jQuery.param(jQuery('body').data('be-filters')) : '';
}

function vgseEndsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
function vgseUniqueArray(ar) {
	var j = {};

	ar.forEach(function (v) {
		if(v){
			j[JSON.stringify(v) + '::' + typeof v] = v;
		}
	});

	return Object.keys(j).map(function (v) {
		return j[v];
	});
}

function vgseMergeDeep(objects) {
	var isObject = function (obj) {
		return obj && typeof obj === 'object'
	};

	return objects.reduce(function (prev, obj) {
		Object.keys(obj).forEach(function (key) {
			var pVal = prev[key];
			var oVal = obj[key];

			if (Array.isArray(pVal) && Array.isArray(oVal)) {
				prev[key] = key === 'meta_query' ? pVal.concat(oVal) : vgseUniqueArray(oVal);
			}
			else if (isObject(pVal) && isObject(oVal)) {
				prev[key] = vgseMergeDeep([pVal, oVal]);
			}
			else {
				prev[key] = oVal;
			}
		});

		return prev;
	}, {});
}
function vgseGoToModal(id) {
	var $opened = jQuery('.remodal-is-opened > .remodal');
	if ($opened.length) {
		$opened.one('closed', function () {
			jQuery('[data-remodal-id="' + id + '"]').remodal().open();
		});
		$opened.remodal().close();
	} else {
		jQuery('[data-remodal-id="' + id + '"]').remodal().open();
	}
}
// Try to decode safely without replacing literal % symbols, but if it fails, decode as normal
function vgseDecodeURIComponentSafe(s) {
	if (!s) {
		return s;
	}

	try {
		var out = decodeURIComponent(s.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
	} catch (error) {
		var out = decodeURIComponent(s);
	}
	return out;
}
/**
 * Add rows filter
 * @param str|obj filter as query string or object
 * @returns Object|Boolean Current filters object or false on error
 */
function beAddRowsFilter(filter) {
	if (!filter) {
		return false;
	}
	var currentFilters = jQuery('body').data('be-filters');
	if (!currentFilters) {
		currentFilters = {};
	}

	var newFilterObj = (typeof filter === 'string') ? beParseParams(filter) : filter;
	var allFilters = vgseMergeDeep([currentFilters, newFilterObj]);
	vgseCleanObject(allFilters);

	var $currentFiltersHolders = jQuery('.vgse-current-filters');
	$currentFiltersHolders.find('.button').remove();

	$currentFiltersHolders.each(function () {
		var $currentFilters = jQuery(this);
		jQuery.each(allFilters, function (filterKey, filterValue) {
			if (filterValue && filterKey.indexOf('meta_query') < 0) {

				var publicValue = (typeof filterValue === 'string') ? filterValue : vgseUniqueArray(filterValue).join(', ');
				publicValue = vgseDecodeURIComponentSafe(vgseStripHtml(publicValue));

				if (publicValue.length > 20) {
					publicValue = publicValue.substring(0, 20) + '...';
				}
				var publicKey = filterKey.replace('[]', '').replace(/_/g, ' ');
				if(publicValue){
					$currentFilters.append('<a href="#" class="button" data-filter-key="' + filterKey + '"><i class="fa fa-remove"></i> ' + publicKey + ': ' + publicValue + '</a>');
				}
			}
		});

		if (allFilters.meta_query) {
			jQuery.each(allFilters.meta_query, function (index, filter) {
				var publicKey = filter.key;
				if (publicKey) {
					var filterKey = 'meta_query';
					var publicValue = filter.value;
					var operator = filter.compare;
					publicValue = vgseDecodeURIComponentSafe(vgseStripHtml(publicValue));

					if (publicValue.length > 20) {
						publicValue = publicValue.substring(0, 20) + '...';
					}
					var filterKey = 'meta_query[' + index + '][key]';
					var $existingFilter = $currentFilters.find('.advanced-filter').filter(function () {
						return jQuery(this).data('filter-key') === filterKey;
					});
					$existingFilter.remove();
					var fieldLabel = typeof vgse_editor_settings.final_spreadsheet_columns_settings[publicKey] !== 'undefined' ? vgse_editor_settings.final_spreadsheet_columns_settings[publicKey].title : publicKey;
					$currentFilters.append('<a href="#" class="button advanced-filter" data-filter-key="' + filterKey + '"><i class="fa fa-remove"></i> ' + fieldLabel + ' ' + operator + ' ' + publicValue + '</a>');
				}
			});
		}

		jQuery('.advanced-filters-list > li').each(function () {
			var $filter = jQuery(this);
			var $field = $filter.find('.wpse-advanced-filters-field-selector');
			var publicKey = $field.val();
			if (publicKey) {
				var filterKey = $field.attr('name');
				var filterValue = $filter.find('.wpse-advanced-filters-value-selector').val();
				var selectedOperator = $filter.find('.wpse-advanced-filters-operator-selector option:selected');
				var operator = selectedOperator.data('custom-label') || selectedOperator.text();
				if (operator === 'ANY') {
					filterValue = filterValue.replace(';', ' OR ').replace('  ', ' ');
				}
				var publicValue = (typeof filterValue === 'string') ? filterValue : filterValue.join(', ');
				publicValue = vgseDecodeURIComponentSafe(vgseStripHtml(publicValue));

				if (publicValue.length > 20) {
					publicValue = publicValue.substring(0, 20) + '...';
				}
				var $existingFilter = $currentFilters.find('.advanced-filter').filter(function () {
					return jQuery(this).data('filter-key') === filterKey;
				});
				$existingFilter.remove();
				var fieldLabel = typeof vgse_editor_settings.final_spreadsheet_columns_settings[publicKey] !== 'undefined' ? vgse_editor_settings.final_spreadsheet_columns_settings[publicKey].title : publicKey;
				$currentFilters.append('<a href="#" class="button advanced-filter" data-filter-key="' + filterKey + '"><i class="fa fa-remove"></i> ' + fieldLabel + ' ' + operator + ' ' + publicValue + '</a>');
			}
		});
		if (!$currentFilters.find('.button').length) {
			$currentFilters.hide();
		} else {
			$currentFilters.css('display', 'inline-block');
		}
	});

	if ($currentFiltersHolders.find('.button').length > 1) {
		$currentFiltersHolders.append('<a href="#" class="button advanced-filter remove-all-filters"><i class="fa fa-remove"></i> ' + vgse_editor_settings.texts.remove_all_filters + '</a>');
	} else {
		$currentFiltersHolders.find('.remove-all-filters').remove();
	}

	jQuery('body').data('be-filters', allFilters);

	return allFilters;
}

/* Ajax calls loop 
 * Execute ajax calls one after another
 * */
function beAjaxLoop(args) {

	//setup an array of AJAX options, each object is an index that will specify information for a single AJAX request

	var defaults = {
		totalCalls: null,
		current: 1,
		url: '',
		method: 'GET',
		dataType: 'json',
		data: {},
		prepareData: function (data, settings) {
			return data;
		},
		onSuccess: function (response, settings) {

		},
		onError: function (jqXHR, textStatus, settings) {

		},
		status: 'running',
	};

	var settings = jQuery.extend(defaults, args);


	//declare your function to run AJAX requests
	function do_ajax() {

		//check to make sure there are more requests to make
		if (settings.current < settings.totalCalls + 1) {

			if (settings.status !== 'running') {
				return true;
			}

			if (Array.isArray(settings.data)) {
				// We update the existing field, if we append new field it will grow on every batch
				// and it will be sending thousands of fields in the requests and the server will start
				// repeating batches because the last position fields would be ignored eventually
				var pageUpdated = false;
				var totalCallsUpdated = false;
				settings.data.forEach(function (singleField, index) {
					if (singleField.name === 'page') {
						settings.data[index].value = settings.current;
						pageUpdated = true;
					}
					if (singleField.name === 'totalCalls') {
						settings.data[index].value = settings.totalCalls;
						totalCallsUpdated = true;
					}
				});
				if (!pageUpdated) {
					settings.data.push({
						name: 'page',
						value: settings.current
					});
				}
				if (!totalCallsUpdated) {
					settings.data.push({
						name: 'totalCalls',
						value: settings.totalCalls
					});
				}
			} else {
				settings.data.page = settings.current;
				settings.data.totalCalls = settings.totalCalls;
			}


			var data = {
				url: settings.url,
				dataType: settings.dataType,
				data: settings.prepareData(settings.data, settings),
				method: settings.method,
			};
			jQuery.ajax(data).done(function (serverResponse) {

				var goNext = settings.onSuccess(serverResponse, settings, data.data);

				//increment the `settings.current` counter and recursively call this function again
				if (goNext) {
					settings.current++;

					setTimeout(function () {
						do_ajax();
					}, parseInt(vgse_editor_settings.wait_between_batches) * 1000);
				}
			}).fail(function (jqXHR, textStatus) {
				var goNext = settings.onError(jqXHR, textStatus, settings);
				//increment the `settings.current` counter and recursively call this function again
				if (goNext) {
					settings.current++;
					setTimeout(function () {
						do_ajax();
					}, parseInt(vgse_editor_settings.wait_between_batches) * 1000);
				}
			});
		}
	}

	//run the AJAX function for the first time once `document.ready` fires
	do_ajax();

	return {
		pause: function () {
			settings.status = 'paused';
		},
		resume: function () {
			settings.status = 'running';
			do_ajax();
		}
	};
}


//  show or hide loading screen
function loading_ajax(options) {

	if (typeof options === 'boolean') {
		options = {
			'estado': options
		};
	}

	var defaults = {
		'estado': true
	}
	jQuery.extend(defaults, options);

	if (defaults.estado == true) {
		if (!jQuery('body').find('.sombra_popup').length) {
			jQuery('body').append('<div class="sombra_popup be-ajax"><div class="sk-three-bounce"><div class="sk-child sk-bounce1"></div><div class="sk-child sk-bounce2"></div><div class="sk-child sk-bounce3"></div></div></div>');
		}
		jQuery('.sombra_popup').fadeIn(1000);
	} else {
		jQuery('.sombra_popup').fadeOut(800);
	}
}


// Show notification to user
function notification(options) {
	var defaults = {
		'tipo': 'success',
		'mensaje': '',
		'time': 8600,
		'position': 'top'
	}
	jQuery.extend(defaults, options);

	setTimeout(function () {
		if (defaults.tipo == 'success') {
			var color = 'green';
		} else if (defaults.tipo == 'error') {
			var color = 'red';
		} else if (defaults.tipo == 'warning') {
			var color = 'orange';
		} else {
			var color = 'blue';
		}

		if (defaults.position === 'bottom') {
			jQuery('#ohsnap').css({
				top: 'auto',
				bottom: '5px'
			});
		} else {
			jQuery('#ohsnap').css({
				top: '',
				bottom: ''
			});
		}

		jQuery('#ohsnap').css('z-index', '1100000');
		setTimeout(function () {
			jQuery('#ohsnap').css('z-index', '-1');
		}, defaults.time);
		jQuery('#ohsnap .alert').remove();
		ohSnap(defaults.mensaje, { duration: defaults.time, color: color });

	}, 500);
}


// Define chunk method to split arrays in groups
if (typeof Array.prototype.chunk === 'undefined') {
	Object.defineProperty(Array.prototype, 'chunk', {
		value: function (chunkSize) {
			var array = this;
			return [].concat.apply([],
				array.map(function (elem, i) {
					return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
				})
			);
		}
	});
}

/**
 * Show notification to user after a failed ajax request.
 * Ex. the server is not available
 */
jQuery(document).ajaxError(function (event, xhr, ajaxOptions, thrownError) {
	var requestData = ajaxOptions.data ? JSON.stringify(ajaxOptions.data) : '';

	// Only show the notification when our ajax requests fail and ignore requests of other plugins
	if (requestData.indexOf('vgse') < 0 && ajaxOptions.url.indexOf(vgse_editor_settings.rest_base_url + 'sheet-editor') < 0) {
		return true;
	}
	loading_ajax(false);
	if (typeof window.vgseDontNotifyServerError === 'boolean' && window.vgseDontNotifyServerError) {
		window.vgseDontNotifyServerError = false;
	} else if (xhr.statusText !== 'abort') {
		if (xhr.status == 400) {
			notification({ mensaje: vgse_editor_settings.texts.http_error_400, tipo: 'error', tiempo: 60000 });
		} else if (xhr.status == 403) {
			notification({ mensaje: vgse_editor_settings.texts.http_error_403, tipo: 'error', tiempo: 60000 });
		} else if (xhr.status == 500 || xhr.status == 502 || xhr.status == 505) {
			notification({ mensaje: vgse_editor_settings.texts.http_error_500_502_505, tipo: 'error', tiempo: 60000 });
		} else if (xhr.status == 503) {
			notification({ mensaje: vgse_editor_settings.texts.http_error_503, tipo: 'error', tiempo: 60000 });
		} else if (xhr.status == 509) {
			notification({ mensaje: vgse_editor_settings.texts.http_error_509, tipo: 'error', tiempo: 60000 });
		} else if (xhr.status == 504) {
			notification({ mensaje: vgse_editor_settings.texts.http_error_504, tipo: 'error', tiempo: 60000 });
		} else if (xhr.status == 404) {
			// Do nothing for 404 responses, they're not considered errors because our API returns 404 when there are no rows
		} else {
			notification({ mensaje: vgse_editor_settings.texts.http_error_default, tipo: 'error', tiempo: 60000 });
		}
	}
});

/**
 * Show notification to user after a successful ajax request with empty response
 */
jQuery(document).ajaxComplete(function (event, xhr, ajaxOptions, thrownError) {

	// We delay this notification to allow the ajax handlers of the individual 
	// requests to disable the notification with window.vgseDontNotifyServerError
	setTimeout(function () {
		if (xhr.statusText !== 'abort' && window.vgse_editor_settings) {
			if (xhr.responseText === '0' || xhr.responseText === 0 || thrownError) {
				loading_ajax(false);
				if (typeof window.vgseDontNotifyServerError === 'boolean' && window.vgseDontNotifyServerError) {
					window.vgseDontNotifyServerError = false;
				} else {
					notification({ mensaje: vgse_editor_settings.texts.http_error_500_502_505, tipo: 'error', tiempo: 60000 });
				}
			}
		}
	}, 500);
});

/**
 * Load posts into the spreadsheet
 * @param obj data ajax request data parameters
 * @param fun callback
 * @param bool customInsert If we want to load rows but use custom success controller.
 */
function beLoadPosts(data, callback, customInsert, removeExisting) {
	loading_ajax(true);

	var timeoutId = setTimeout(function () {
		jQuery('.wpse-stuck-loading').css('display', 'block');
	}, 5000);

	// This notification appears when the automatic loading of rows is disabled
	// remove it when they start loading the rows manually
	jQuery('.automatic-loading-rows-disabled').remove();

	if (!customInsert) {
		customInsert = true;
	}
	if (!removeExisting) {
		removeExisting = false;
	}
	data.action = 'vgse_load_data';
	data.wpse_source_suffix = vgse_editor_settings.wpse_source_suffix || '';

	if (!data.paged) {
		data.paged = 1;
	}

	window.beCurrentPage = data.paged;

	// Apply filters to request
	data.filters = vgseGetFiltersJson();
	window.beLastLoadRowsAjax = jQuery.ajax({
		url: vgse_global_data.ajax_url,
		//		url: vgse_global_data.ajax_url+'?XDEBUG_PROFILE=1',
		dataType: 'json',
		type: 'POST',
		data: data,
		success: function (response) {
			// Auto open modals when the page contains the hash #after_init:modalId
			// We can't use the regular hash format #modalId because remodal opens the modals
			// Too early before WPSE loaded so they break
			if (window.beCurrentPage === 1 && window.location.hash.indexOf('#after_init:') === 0) {
				jQuery('[data-remodal-id="' + window.location.hash.replace('#after_init:', '') + '"]').remodal().open();
				window.location.hash = '';
			}
			jQuery('.wpse-stuck-loading').hide();
			clearTimeout(timeoutId);
			if (response.data.pagination) {
				jQuery('.pagination-links').empty().append(response.data.pagination);
				jQuery('.pagination-jump input').attr('max', response.data.max_pages);
			}

			// Adjust width of the page wrapper based on the table width, so other elements are positioned correctly
			jQuery('#vgse-wrapper').css('min-width', jQuery('#post-data .wtHider').width());

			jQuery('body').trigger('vgSheetEditor:beforeRowsInsert', [response, data, callback, customInsert, removeExisting]);
			if (typeof callback === 'function') {
				callback(response);
				if (customInsert) {
					return true;
				}
			}
			if (response.success) {

				// Add rows to spreadsheet			
				vgseAddFoundRowsCount(response.data.total);
				vgAddRowsToSheet(response.data.rows, null, removeExisting);
				var successMessage = response.data.message || vgse_editor_settings.texts.posts_loaded;
				notification({ mensaje: successMessage, tipo: 'info' });
				loading_ajax(false);
			} else {
				// Disable loading screen and notify of error
				loading_ajax(false);
				notification({ mensaje: response.data.message, tipo: 'info' });
				vgseAddFoundRowsCount(0);
			}
		},
		error: function (jqXHR, exception) {
			// If we detect the server is overloaded because posts_per_page is too high,
			// reset the posts_per_page and retry
			var reducePerPageNumber = vgse_editor_settings.posts_per_page >= 100 && (jqXHR.status >= 500 || exception === 'timeout');
			if (reducePerPageNumber) {
				window.vgseDontNotifyServerError = true;
				vgse_editor_settings.posts_per_page = 10;
				data.wpse_reset_posts_per_page = vgse_editor_settings.posts_per_page;
				beLoadPosts(data, callback, customInsert, removeExisting);
				setTimeout(function () {
					loading_ajax(true);
				}, 200);
			}
		}
	});
}

//  A formatted version of a popular md5 implementation.
//  Original copyright (c) Paul Johnston & Greg Holt.
//  The function itself is now 42 lines long.

function vgseMd5(inputString) {
	var hc = "0123456789abcdef";
	function rh(n) { var j, s = ""; for (j = 0; j <= 3; j++) s += hc.charAt((n >> (j * 8 + 4)) & 0x0F) + hc.charAt((n >> (j * 8)) & 0x0F); return s; }
	function ad(x, y) { var l = (x & 0xFFFF) + (y & 0xFFFF); var m = (x >> 16) + (y >> 16) + (l >> 16); return (m << 16) | (l & 0xFFFF); }
	function rl(n, c) { return (n << c) | (n >>> (32 - c)); }
	function cm(q, a, b, x, s, t) { return ad(rl(ad(ad(a, q), ad(x, t)), s), b); }
	function ff(a, b, c, d, x, s, t) { return cm((b & c) | ((~b) & d), a, b, x, s, t); }
	function gg(a, b, c, d, x, s, t) { return cm((b & d) | (c & (~d)), a, b, x, s, t); }
	function hh(a, b, c, d, x, s, t) { return cm(b ^ c ^ d, a, b, x, s, t); }
	function ii(a, b, c, d, x, s, t) { return cm(c ^ (b | (~d)), a, b, x, s, t); }
	function sb(x) {
		var i; var nblk = ((x.length + 8) >> 6) + 1; var blks = new Array(nblk * 16); for (i = 0; i < nblk * 16; i++) blks[i] = 0;
		for (i = 0; i < x.length; i++) blks[i >> 2] |= x.charCodeAt(i) << ((i % 4) * 8);
		blks[i >> 2] |= 0x80 << ((i % 4) * 8); blks[nblk * 16 - 2] = x.length * 8; return blks;
	}
	var i, x = sb(inputString), a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, olda, oldb, oldc, oldd;
	for (i = 0; i < x.length; i += 16) {
		olda = a; oldb = b; oldc = c; oldd = d;
		a = ff(a, b, c, d, x[i + 0], 7, -680876936); d = ff(d, a, b, c, x[i + 1], 12, -389564586); c = ff(c, d, a, b, x[i + 2], 17, 606105819);
		b = ff(b, c, d, a, x[i + 3], 22, -1044525330); a = ff(a, b, c, d, x[i + 4], 7, -176418897); d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
		c = ff(c, d, a, b, x[i + 6], 17, -1473231341); b = ff(b, c, d, a, x[i + 7], 22, -45705983); a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
		d = ff(d, a, b, c, x[i + 9], 12, -1958414417); c = ff(c, d, a, b, x[i + 10], 17, -42063); b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
		a = ff(a, b, c, d, x[i + 12], 7, 1804603682); d = ff(d, a, b, c, x[i + 13], 12, -40341101); c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
		b = ff(b, c, d, a, x[i + 15], 22, 1236535329); a = gg(a, b, c, d, x[i + 1], 5, -165796510); d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
		c = gg(c, d, a, b, x[i + 11], 14, 643717713); b = gg(b, c, d, a, x[i + 0], 20, -373897302); a = gg(a, b, c, d, x[i + 5], 5, -701558691);
		d = gg(d, a, b, c, x[i + 10], 9, 38016083); c = gg(c, d, a, b, x[i + 15], 14, -660478335); b = gg(b, c, d, a, x[i + 4], 20, -405537848);
		a = gg(a, b, c, d, x[i + 9], 5, 568446438); d = gg(d, a, b, c, x[i + 14], 9, -1019803690); c = gg(c, d, a, b, x[i + 3], 14, -187363961);
		b = gg(b, c, d, a, x[i + 8], 20, 1163531501); a = gg(a, b, c, d, x[i + 13], 5, -1444681467); d = gg(d, a, b, c, x[i + 2], 9, -51403784);
		c = gg(c, d, a, b, x[i + 7], 14, 1735328473); b = gg(b, c, d, a, x[i + 12], 20, -1926607734); a = hh(a, b, c, d, x[i + 5], 4, -378558);
		d = hh(d, a, b, c, x[i + 8], 11, -2022574463); c = hh(c, d, a, b, x[i + 11], 16, 1839030562); b = hh(b, c, d, a, x[i + 14], 23, -35309556);
		a = hh(a, b, c, d, x[i + 1], 4, -1530992060); d = hh(d, a, b, c, x[i + 4], 11, 1272893353); c = hh(c, d, a, b, x[i + 7], 16, -155497632);
		b = hh(b, c, d, a, x[i + 10], 23, -1094730640); a = hh(a, b, c, d, x[i + 13], 4, 681279174); d = hh(d, a, b, c, x[i + 0], 11, -358537222);
		c = hh(c, d, a, b, x[i + 3], 16, -722521979); b = hh(b, c, d, a, x[i + 6], 23, 76029189); a = hh(a, b, c, d, x[i + 9], 4, -640364487);
		d = hh(d, a, b, c, x[i + 12], 11, -421815835); c = hh(c, d, a, b, x[i + 15], 16, 530742520); b = hh(b, c, d, a, x[i + 2], 23, -995338651);
		a = ii(a, b, c, d, x[i + 0], 6, -198630844); d = ii(d, a, b, c, x[i + 7], 10, 1126891415); c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
		b = ii(b, c, d, a, x[i + 5], 21, -57434055); a = ii(a, b, c, d, x[i + 12], 6, 1700485571); d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
		c = ii(c, d, a, b, x[i + 10], 15, -1051523); b = ii(b, c, d, a, x[i + 1], 21, -2054922799); a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
		d = ii(d, a, b, c, x[i + 15], 10, -30611744); c = ii(c, d, a, b, x[i + 6], 15, -1560198380); b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
		a = ii(a, b, c, d, x[i + 4], 6, -145523070); d = ii(d, a, b, c, x[i + 11], 10, -1120210379); c = ii(c, d, a, b, x[i + 2], 15, 718787259);
		b = ii(b, c, d, a, x[i + 9], 21, -343485551); a = ad(a, olda); b = ad(b, oldb); c = ad(c, oldc); d = ad(d, oldd);
	}
	return rh(a) + rh(b) + rh(c) + rh(d);
}

function vgseGetFiltersJson() {
	return jQuery('body').data('be-filters') ? JSON.stringify(jQuery('body').data('be-filters')) : '';
}

function beSetSaveButtonStatus(status) {
	var $saveStatusIndicator = jQuery('.button-container.auto_saving_status-container a');
	var $button = jQuery('#vg-header-toolbar .wpse-save, #vg-header-toolbar .wpse-save-later');
	if (status) {
		vgseAllowToClosePageWithoutWarning(false);
		$button.each(function () {
			jQuery(this).attr('data-remodal-target', jQuery(this).data('original-remodal-target'));
		});
		$button.removeClass('disabled');

		// Deactivate the buttons that require all changes to be saved
		var $buttonsThatRequireSaving = jQuery('.wpse-disable-if-unsaved-changes');
		$buttonsThatRequireSaving.each(function () {
			jQuery(this).addClass('disabled');
			jQuery(this).attr('data-remodal-target-original', jQuery(this).attr('data-remodal-target'));
			jQuery(this).removeAttr('data-remodal-target');
		});
		if (vgse_editor_settings.enable_auto_saving) {
			$saveStatusIndicator.text($saveStatusIndicator.data('unsaved-changes'));
		}

	} else {
		vgseAllowToClosePageWithoutWarning(true);
		$button.each(function () {
			jQuery(this).attr('data-original-remodal-target', jQuery(this).data('remodal-target'));
			jQuery(this).removeAttr('data-remodal-target');
		});
		$button.addClass('disabled');

		// Activate the buttons that require all changes to be saved
		var $buttonsThatRequireSaving = jQuery('.wpse-disable-if-unsaved-changes');
		$buttonsThatRequireSaving.each(function () {
			jQuery(this).removeClass('disabled');
			jQuery(this).attr('data-remodal-target', jQuery(this).attr('data-remodal-target-original'));
		});
		if (vgse_editor_settings.enable_auto_saving) {
			$saveStatusIndicator.text($saveStatusIndicator.data('saved-changes'));
		}
	}
}

/**
 * Remove duplicated items from array
 * @param array data
 * @returns array
 */
function beDeduplicateItems(data) {
	if (!data || !data.length) {
		return data;
	}
	var out = {};
	var type = (data[0] instanceof Array) ? 'array' : 'object';
	jQuery.each(data, function (key, item) {
		var id = (type === 'array') ? item[0] : item.ID;

		if (typeof id === 'string') {
			id = parseInt(id);
		}
		if (!out[id]) {
			out[id] = item;
		}
	});
	return out;
}

/**
 * Get modified object properties
 * @param obj orig
 * @param obj update
 * @returns obj
 */
function beGetModifiedObjectProperties(orig, update) {
	var diff = {};

	Object.keys(update).forEach(function (key) {
		// Key === 0 is the bulk selector checkbox which should not be included as modified cell to save
		if (key !== '0' && key !== 'wpseBulkSelector' && (!orig || typeof orig[key] === 'undefined' || update[key] != orig[key])) {
			diff[key] = update[key];
		}
	})

	return diff;
}

/**
 * Check if arrays are identical recursively
 * @param array arr1
 * @param array arr2
 * @returns Boolean
 */
function beArraysIdenticalCheck(arr1, arr2) {
	if (arr1.length !== arr2.length) {
		return false;
	}
	for (var i = arr1.length; i--;) {
		if (arr1[i] !== arr2[i]) {
			return false;
		}
	}

	return true;
}
/**
 * Compare arrays and return modified items only.
 * 
 * @param array newData
 * @param array originalData
 * @returns array
 */
function beGetModifiedItems(newData, originalData) {
	if (!newData) {
		var newData = hot.getSourceData();
	}
	if (!originalData) {
		var originalData = window.beOriginalData;
	}

	var newData = beDeduplicateItems(newData);
	var originalData = beDeduplicateItems(originalData);
	var out = [];

	jQuery.each(newData, function (id, item) {
		var modifiedProperties = beGetModifiedObjectProperties(originalData[id], newData[id]);

		var saveData;
		if (typeof originalData[id] === 'undefined' || !jQuery.isEmptyObject(modifiedProperties)) {
			if (!originalData[id] || (originalData[id].provider && vgse_editor_settings.saveFullRowPostTypes && vgse_editor_settings.saveFullRowPostTypes.indexOf(originalData[id].provider) > -1)) {
				saveData = newData[id];
			} else {
				modifiedProperties.ID = id;
				saveData = modifiedProperties;
			}

			out.push(saveData);
		}
	});

	return out;
}
function vgseTinymce_getContent(editor_id, textarea_id) {
	if (typeof editor_id == 'undefined') editor_id = wpActiveEditor;
	if (typeof textarea_id == 'undefined') textarea_id = editor_id;

	if (jQuery('#wp-' + editor_id + '-wrap').hasClass('tmce-active') && tinyMCE.get(editor_id)) {
		return tinyMCE.get(editor_id).getContent();
	} else {
		return jQuery('#' + textarea_id).val();
	}
}

function vgseTinymce_setContent(content, editor_id, textarea_id) {
	if (typeof editor_id == 'undefined') editor_id = wpActiveEditor;
	if (typeof textarea_id == 'undefined') textarea_id = editor_id;

	if (jQuery('#wp-' + editor_id + '-wrap').hasClass('tmce-active') && tinyMCE.get(editor_id)) {
		return tinyMCE.get(editor_id).setContent(content);
	} else {
		return jQuery('#' + textarea_id).val(content);
	}
}

function vgseTinymce_focus(editor_id, textarea_id) {
	if (typeof editor_id == 'undefined') editor_id = wpActiveEditor;
	if (typeof textarea_id == 'undefined') textarea_id = editor_id;

	if (jQuery('#wp-' + editor_id + '-wrap').hasClass('tmce-active') && tinyMCE.get(editor_id)) {
		return tinyMCE.get(editor_id).focus();
	} else {
		return jQuery('#' + textarea_id).focus();
	}
}
/**
 * Get tinymce editor content
 * @returns string
 */
function beGetTinymceContent() {
	return wp.editor.getContent('editpost');
}

/**
 * Execute function by string name
 */
function vgseExecuteFunctionByName(functionName, context /*, args */) {
	var functionName = functionName.trim();
	var args = [].slice.call(arguments).splice(2);
	var namespaces = functionName.split(".");
	var func = namespaces.pop();
	for (var i = 0; i < namespaces.length; i++) {
		context = context[namespaces[i]];
	}
	return context[func].apply(context, args);
}

/**
 * Convert an object to array of values
 * @param obj object
 * @returns Array
 */
function vgObjectToArray(object) {
	var values = [];
	for (var property in object) {
		values.push(object[property]);
	}
	return values;
}


/**
 * Returns a function, that, as long as it continues to be invoked, will not be triggered. The function will be called after it stops being called for N milliseconds. If immediate is passed, trigger the function on the leading edge, instead of the trailing.
 * @param func func
 * @param int wait
 * @param bool immediate
 * @returns func
 */
function _debounce(func, wait, immediate) {
	var timeout, args, context, timestamp, result;

	var later = function () {
		var last = _now() - timestamp;

		if (last < wait && last >= 0) {
			timeout = setTimeout(later, wait - last);
		} else {
			timeout = null;
			if (!immediate) {
				result = func.apply(context, args);
				if (!timeout)
					context = args = null;
			}
		}
	};

	return function () {
		context = this;
		args = arguments;
		timestamp = _now();
		var callNow = immediate && !timeout;
		if (!timeout)
			timeout = setTimeout(later, wait);
		if (callNow) {
			result = func.apply(context, args);
			context = args = null;
		}

		return result;
	};
}
;

/**
 * A (possibly faster) way to get the current timestamp as an integer.
 * @returns int
 */
function _now() {
	var out = Date.now() || new Date().getTime();
	return out;
}

/**
 * Returns a function, that, when invoked, will only be triggered at most once during a given window of time. Normally, the throttled function will run as much as it can, without ever going more than once per wait duration; but if you’d like to disable the execution on the leading edge, pass {leading: false}. To disable execution on the trailing edge, ditto.
 * @param func
 * @param int wait
 * @param obj options
 * @returns func
 */
function _throttle(func, wait, options) {

	if (!wait) {
		wait = 300;
	}
	var context, args, result;
	var timeout = null;
	var previous = 0;
	if (!options)
		options = {};
	var later = function () {
		previous = options.leading === false ? 0 : _now();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout)
			context = args = null;
	};
	return function () {
		var now = _now();
		if (!previous && options.leading === false)
			previous = now;
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			result = func.apply(context, args);
			if (!timeout)
				context = args = null;
		} else if (!timeout && options.trailing !== false) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};
}
;

/**
 * Remove multiple rows from the sheet by ID
 * @param array rowIds list of IDs to remove
 * @returns null
 */
function vgseRemoveRowFromSheetByID(rowIds, updateCount) {

	if (rowIds.length) {
		var hotData = hot.getSourceData();
		rowIds.forEach(function (rowId) {
			hotData = vgseRemoveRowFromArray(rowId, hotData);
		});
		hot.loadData(hotData);
		vgseUpdateTableWrapperMinHeight();
		if (updateCount) {
			var count = parseInt(jQuery('.be-total-rows .item-value').text());
			vgseAddFoundRowsCount(count - rowIds.length);
		}
	}
}
/**
 * Remove post ID from array of data
 */
function vgseRemoveRowFromArray(postId, data) {

	var newData = [];

	postId = parseInt(postId);
	data.forEach(function (item, id) {
		var item2 = jQuery.extend(true, {}, item);

		if (typeof item2.ID === 'string') {
			item2.ID = parseInt(item2.ID);
		}
		if (postId !== item2.ID) {
			newData.push(item);
		}
	});
	return newData;
}

/**
 * Add rows to spreadsheet
 * @param array data Array of objects
 * @param str method append | prepend
 * @returns null
 */
function vgAddRowsToSheet(data, method, removeExisting) {
	if (!window.beOriginalData) {
		window.beOriginalData = [];
	}
	if (!method) {
		method = 'append';
	}

	if (!data) {
		data = [];
	}

	if (method === 'prepend') {
		data = data.reverse();
	}

	var hotData = hot.getSourceData();


	// Remove existing items from spreadsheet
	if (removeExisting) {
		data.forEach(function (item, id) {
			var item2 = jQuery.extend(true, {}, item);
			item2.ID = parseInt(item2.ID);

			hotData = vgseRemoveRowFromArray(item2.ID, hotData);
			window.beOriginalData = vgseRemoveRowFromArray(item2.ID, window.beOriginalData);
		});
	}

	var sheetIds = hotData.map(function (a) {
		return a.ID;
	});
	for (i = 0; i < data.length; i++) {
		// Don't add new items already existing on spreadsheet,
		// fixes rare mysql bug that paginated requests sometimes bring repeated rows
		if (sheetIds.indexOf(data[i].ID) < 0) {
			if (method === 'append') {
				hotData.push(jQuery.extend(true, {}, data[i]));
			} else {
				hotData.unshift(jQuery.extend(true, {}, data[i]));
			}
		}

	}
	hot.loadData(hotData);

	jQuery('body').trigger('vgSheetEditor:afterRowsInsert', [data, method, removeExisting]);
	vgseUpdateTableWrapperMinHeight();

	// Save original data, used to compare posts 
	// before saving and save only modified posts.
	window.beOriginalData = jQuery.merge(window.beOriginalData, data);
}

/**
 * This is required because the table lazy loads the rows, causing the table to height a different height than 
 * the visible rows, so the content below the table might appear on top of the final rows.
 */
function vgseUpdateTableWrapperMinHeight() {
	jQuery('#post-data').css('min-height', jQuery('#vgse-wrapper .handsontable .ht_master tbody tr:last-child').height() * hot.countRows());
}
/**
 * save image in local cache
 */
function wpsePrepareGalleryFilesForCellFormat(gallery, cellCoords) {
	var columnKey = hot.colToProp(cellCoords.col);
	var columnSettings = vgse_editor_settings.final_spreadsheet_columns_settings[columnKey];
	var multiple = columnSettings && typeof columnSettings.wp_media_multiple !== 'undefined' && columnSettings.wp_media_multiple;

	var currentValue = hot.getDataAtCell(cellCoords.row, cellCoords.col);
	var fileUrls = (multiple && currentValue) ? currentValue.split(',') : [];

	jQuery.each(gallery, function (index, file) {
		fileUrls.push(file.url + '?wpId=' + file.id);
	});

	hot.setDataAtCell(cellCoords.row, cellCoords.col, fileUrls.join(','));
}

/**
 *Init select2 on <select>s
 */
function vgseInitSelect2($selects) {

	if (!$selects) {
		var $selects = jQuery("select.select2");
	}
	// Convert to jQuery element in case we receive DOM objects
	$selects = jQuery($selects);
	$selects.each(function () {
		var $select = jQuery(this);
		var config = {
			placeholder: jQuery(this).data('placeholder'),
			tags: jQuery(this).data('tags') ? true : false,
			minimumInputLength: jQuery(this).data('min-input-length') || 0,
			allowClear: true,
		};
		if (jQuery(this).data('select2-template')) {
			config.templateResult = function (item) {
				return vgseExecuteFunctionByName($select.data('select2-template'), window, item);
			};
		}
		if (jQuery(this).data('remote')) {
			config.ajax = {
				url: vgse_global_data.ajax_url,
				delay: 1000,
				data: function (params) {
					var query = {
						search: params.term,
						page: params.page,
						action: jQuery(this).data('action'),
						global_search: jQuery(this).data('global-search') || '',
						output_format: jQuery(this).data('output-format'),
						taxonomies: jQuery(this).data('taxonomies'),
						post_type: jQuery(this).data('post-type') || jQuery('#post-data').data('post-type'),
						nonce: jQuery('#vgse-wrapper').data('nonce'),
					}

					if (jQuery(this).data('extra_ajax_parameters')) {
						query = jQuery.extend({}, query, jQuery(this).data('extra_ajax_parameters'));
					}

					// Query paramters will be ?search=[term]&page=[page]
					return query;
				},
				processResults: function (response) {
					$select.next('.select2-ajax-error').remove();
					if (!response.success) {
						if (response.data && response.data.message) {
							$select.after('<p class="select2-ajax-error">' + response.data.message + '</p>');
						}
						return {
							results: []
						};
					}
					var out = response.data.data || [];
					if (response.data && jQuery.isArray(response.data) && typeof response.data[0] === 'string') {
						var newData = [];
						response.data.forEach(function (value) {
							newData.push({
								id: value,
								text: value
							});
						});
						out = newData;
					} else if (response.data.data && !jQuery.isArray(response.data.data)) {
						var newData = [];
						for (var key in response.data.data) {
							newData.push({
								id: key,
								text: response.data.data[key]
							});
						}
						out = newData;
					}
					return {
						results: out
					};
				},
				cache: true
			};
		}
		jQuery(this).select2(config);
	});
}

/**
 * Reload spreadsheet.
 * Removes current rows and loads the rows from the server again.
 */
function vgseReloadSpreadsheet(safeReload, notificationText, paged) {

	if (safeReload) {
		if (!notificationText) {
			notificationText = vgse_editor_settings.texts.save_changes_reload_optional;
		}
		var fullData = hot.getSourceData();
		fullData = beGetModifiedItems(fullData, window.beOriginalData);
		if (fullData.length) {
			alert(notificationText);
			return true;
		}
	}

	var nonce = jQuery('.remodal-bg').data('nonce');
	var $container = jQuery("#post-data");

	// Reset internal cache, used to find the modified cells for saving        
	window.beOriginalData = [];
	// Reset spreadsheet
	hot.loadData([]);

	beLoadPosts({
		post_type: $container.data('post-type'),
		nonce: nonce,
		paged: paged || 1
	});
}

function vgseAddFoundRowsCount(total) {

	window.beFoundRows = total;
	jQuery('.be-total-rows .item-value').text(total);
	wp.hooks.doAction('vgseAddFoundRowsCount', total);
}

function vgseGetRowTitle(rowIndex) {
	var rowTitleIndex = window.vgseFormulasBulkSelectorExists ? 2 : 1;
	var title = vgse_editor_settings.is_post_type ? hot.getDataAtRowProp(rowIndex, 'post_title') : hot.getDataAtCell(rowIndex, rowTitleIndex);
	return title;
}
function vgseInputToFormattedColumnField(selectedField, $fields, valueFieldSelector) {
	if (typeof vgse_editor_settings.final_spreadsheet_columns_settings[selectedField] !== 'undefined') {
		var columnSettings = vgse_editor_settings.final_spreadsheet_columns_settings[selectedField];
		var $value = $fields.find(valueFieldSelector);
		var valueName = $value.attr('name');
		var valueClasses = $value.attr('class');

		// if the field is not a text input, it means it's already formatted, exit
		if (!$value || (!$value.is('input') && !$value.is('textarea')) || ($value.attr('type') && $value.attr('type') !== 'text')) {
			return true;
		}
		var alpineModel = $value.attr('x-model') ? ' x-model="'+$value.attr('x-model')+'"' : '';
		if (typeof columnSettings.formatted.editor !== 'undefined' && columnSettings.formatted.editor === 'select') {
			$value.replaceWith('<select class="' + valueClasses + '" name="' + valueName + '" '+alpineModel+'><option value="">(' + vgse_editor_settings.texts.empty + ')</option></select>');
			var $newValue = $fields.find('select' + valueFieldSelector);

			$newValue.each(function () {
				var $singleValue = jQuery(this);
				var allKeys = Object.keys(columnSettings.formatted.selectOptions);
				// If the selectOptions have 0 as the first value and last value, it means it's an array of values without keys and use the labels as value
				var useLabelsasValues = allKeys[0] === '0' && jQuery.isNumeric(allKeys[allKeys.length - 1]);
				jQuery.each(columnSettings.formatted.selectOptions, function (key, label) {
					if (useLabelsasValues) {
						key = label;
					}
					$singleValue.append('<option value="' + key + '">' + label + '</option>');
				});
			});
		} else if (typeof columnSettings.formatted.type !== 'undefined' && columnSettings.formatted.type === 'autocomplete' && typeof columnSettings.formatted.source === 'string' && columnSettings.formatted.source === "searchUsers") {
			$value.replaceWith('<input class="' + valueClasses + '" name="' + valueName + '" '+alpineModel+' list="wpse-bulk-edit-users-list-' + selectedField + '" type="text"><datalist class="' + valueClasses + '" id="wpse-bulk-edit-users-list-' + selectedField + '"></datalist>');

			$fields.find('input[list="wpse-bulk-edit-users-list-' + selectedField + '"]').keyup(_throttle(function (e) {
				var query = jQuery(this).val();
				if (!query) {
					return true;
				}
				var $input = jQuery(this);
				if ($input.data('last-query') === query) {
					return true;
				}
				$input.data('last-query', query);
				var nonce = jQuery('.remodal-bg').data('nonce');
				var post_type = vgse_editor_settings.post_type;
				var $list = $fields.find('datalist#wpse-bulk-edit-users-list-' + selectedField);

				jQuery.ajax({
					url: vgse_global_data.ajax_url,
					dataType: 'json',
					data: {
						action: "vgse_find_users_by_keyword",
						search: query,
						nonce: nonce,
						post_type: post_type,
						wpse_source: 'users_dropdown_column'
					},
					success: function (response) {
						var users = [];
						if (response.success) {
							users = response.data.data;
						}
						$list.empty();
						users.forEach(function (user) {
							$list.append('<option value="' + user + '">' + user + '</option>');
						});

					}
				});
			}, 1500, {
				leading: true,
				trailing: true
			}));
		} else if (typeof columnSettings.formatted.type !== 'undefined' && columnSettings.formatted.type === 'autocomplete' && typeof columnSettings.formatted.source === 'object') {
			$value.replaceWith('<select class="' + valueClasses + '" name="' + valueName + '" '+alpineModel+'><option value="">(' + vgse_editor_settings.texts.empty + ')</option></select>');
			var $newValue = $fields.find('select' + valueFieldSelector);

			$newValue.each(function () {
				var $singleValue = jQuery(this);
				jQuery.each(columnSettings.formatted.source, function (key, label) {
					if (jQuery.isNumeric(key)) {
						key = label;
					}
					$singleValue.append('<option value="' + key + '">' + label + '</option>');
				});
			});
		} else if (typeof columnSettings.formatted.type !== 'undefined' && columnSettings.formatted.type === 'checkbox') {
			$value.replaceWith('<input type="checkbox" class="' + valueClasses + '">');

			var $newValue = $fields.find('input' + valueFieldSelector + ':checkbox');
			$newValue.after('<input type="hidden" name="' + valueName + '" '+alpineModel+' class="wpse-hidden-value ' + valueClasses + '" />');

			$newValue.on('change', function () {
				if (jQuery(this).is(':checked')) {
					jQuery(this).val(columnSettings.formatted.checkedTemplate);
					jQuery(this).data('checked-value', columnSettings.formatted.checkedTemplate);
					$fields.find('.wpse-hidden-value').val(columnSettings.formatted.checkedTemplate);
				} else {
					jQuery(this).val(columnSettings.formatted.uncheckedTemplate);
					jQuery(this).data('unchecked-value', columnSettings.formatted.uncheckedTemplate);
					$fields.find('.wpse-hidden-value').val(columnSettings.formatted.uncheckedTemplate);
				}
				
				// Alpine.js requires this manual trigger to update the model, since it doesn't detect programmatic field value updates
				if(alpineModel) {
					$fields.find('.wpse-hidden-value').get(0).dispatchEvent(new Event('input'))
				}
			});
			$newValue.trigger('change');
		} else if (typeof columnSettings.formatted.type !== 'undefined' && columnSettings.formatted.type === 'date') {
			if (columnSettings.formatted.editor === 'wp_datetime') {
				$value.replaceWith('<input type="datetime-local" class="' + valueClasses + '" step="1">');
			} else {
				$value.replaceWith('<input type="date" class="' + valueClasses + '">');
			}
			var $newValue = $fields.find('input' + valueFieldSelector);
			$newValue.after('<input type="hidden" name="' + valueName + '" '+alpineModel+' class="wpse-hidden-value ' + valueClasses + '" />');
			$newValue.on('change', function () {
				var value = jQuery(this).val();
				if (value) {
					if ($newValue.prop('type') === 'datetime-local') {
						var m = moment.utc(value, 'YYYY-MM-DDTH:mm:ss');
					} else {
						var m = moment.utc(value + ' 0:00:00', 'YYYY-MM-DD H:mm:ss');
					}
					var dateFormat = columnSettings.formatted.customDatabaseFormatJs || columnSettings.formatted.dateFormatJs;
					if (!dateFormat) {
						var dateFormat = columnSettings.formatted.customDatabaseFormat || columnSettings.formatted.dateFormat;
					}
					var dateToSave = m.format(dateFormat);
				} else {
					var dateToSave = '';
				}
				$fields.find('.wpse-hidden-value').val(dateToSave).attr('value', dateToSave);

				// Alpine.js requires this manual trigger to update the model, since it doesn't detect programmatic field value updates
				if(alpineModel) {
					$fields.find('.wpse-hidden-value').get(0).dispatchEvent(new Event('input'))
				}
			});
			$newValue.trigger('change');
		}
	}
}

function vgseRemoveAllFilters(reloadSpreadsheet) {
	jQuery('body').data('be-filters', {});
	jQuery('.vgse-current-filters .button').remove();
	if (reloadSpreadsheet) {
		vgseReloadSpreadsheet();
	}
}

function vgseInitLazySelects(lazy_loaded_select_options) {
	var $selects = jQuery('select[data-lazy-key]:not([data-already-lazy])');
	$selects.each(function () {
		vgseLazySelect(jQuery(this), jQuery(this).data('lazy-key'), lazy_loaded_select_options);
	});
}
/**
 * This will lazy load the select options in plain selects.
 * It will automaticallyremove all the options, except the selected option,
 * And it will automatically add the options when the select is expanded,
 * And remove the unselected options when the select is closed.
 * 
 * @param $select 
 * @param key 
 * @returns 
 */
function vgseLazySelect($select, key, lazy_loaded_select_options) {
	if ($select.attr('multiple')) {
		return true;
	}
	if(!lazy_loaded_select_options){
		var lazy_loaded_select_options = vgse_editor_settings.lazy_loaded_select_options;
	}
	if (!lazy_loaded_select_options) {
		lazy_loaded_select_options = {};
	}
	var options = {};
	var generateOptionsFromSelect = function () {
		$select.find('option').each(function () {
			if (jQuery(this).parent('optgroup').length) {
				if (typeof options[jQuery(this).parent('optgroup').attr('label')] === 'undefined') {
					options[jQuery(this).parent('optgroup').attr('label')] = {};
				}

				options[jQuery(this).parent('optgroup').attr('label')][jQuery(this).val()] = jQuery(this).text();
			} else {
				options[jQuery(this).val()] = jQuery(this).text();
			}
		});
		lazy_loaded_select_options[key] = options;
	};
	var removeUnselectedElements = function () {
		var $selectedElement = $select.find('option:selected');
		var $selectedOptgroup = null;
		if ($selectedElement && $selectedElement.parent('optgroup').length) {
			$selectedOptgroup = $selectedElement.parent('optgroup');
		}

		// Don't remove the empty option to allow other JS to unset the select value
		// For example, the import > mapping has the option to unselect the mapping and 
		// it breaks if the select doesn't have the empty option
		var $toRemove = $select.find('option').not($selectedElement).not($select.find('option[value=""]'));
		$toRemove.remove();

		$select.find('optgroup').each(function () {
			if (!jQuery(this).children().length) {
				jQuery(this).remove();
			}
		});
	}

	if (!lazy_loaded_select_options || !lazy_loaded_select_options[key]) {
		generateOptionsFromSelect();
	}

	if (!$select.find('option').length && typeof $select.data('selected') === 'string') {
		$select.append('<option value="' + vgseStripHtml($select.data('selected')) + '">' + vgseStripHtml(lazy_loaded_select_options[key][$select.data('selected')]) + '</option>');
	}
	removeUnselectedElements();

	$select.on('focus', function (e) {
		var options = lazy_loaded_select_options[key];
		if (options) {
			var selected = $select.val();
			$select.empty();
			jQuery.each(options, function (key, label) {
				if (typeof label === 'string') {
					$select.append('<option value="' + vgseStripHtml(key) + '">' + vgseStripHtml(label) + '</option>');
				} else {
					$select.append('<optgroup label="' + vgseStripHtml(key) + '"></optgroup>');
					jQuery.each(label, function (itemKey, itemLabel) {
						$select.find('optgroup[label="' + vgseStripHtml(key) + '"]').append('<option value="' + vgseStripHtml(itemKey) + '">' + vgseStripHtml(itemLabel) + '</option>');
					});
				}
			});
			$select.val(selected);
		}
	});
	$select.on('blur', function (e) {
		removeUnselectedElements();
	});
}
function vgseSetSettings(data, reloadAfterSuccess, silentAction) {
	data.push({
		name: 'nonce',
		value: jQuery('#vgse-wrapper').data('nonce')
	});
	data.push({
		name: 'action',
		value: 'vgse_set_settings'
	});
	if (!silentAction) {
		loading_ajax(true);
	}
	jQuery.ajax({
		url: vgse_global_data.ajax_url,
		method: 'POST',
		data: data,
		success: function (response) {
			if (!silentAction) {
				loading_ajax(false);
			}
			// Remove the hash from the url so it doesn't open the settings popup again after reload
			window.location.hash = '';
			if (response.success && reloadAfterSuccess) {
				window.location.reload();
			}
		}
	});
}

function vgseGetSelectedRowsCount($container) {

	var foundRowsToEdit = window.beFoundRows;
	if ($container.find('.wpse-select-rows-options').val() === 'selected') {
		var selectedIds = vgseGetSelectedIds();
		foundRowsToEdit = selectedIds.length;
	}
	if ($container.find('.wpse-select-rows-options').val() === 'previously_selected') {
		var selectedIds = window.wpsePreviouslySelectedIds || [];
		foundRowsToEdit = selectedIds.length;
	}
	return foundRowsToEdit;
}
function vgseGetSelectedIds() {
	// If the checkboxes column doesn't exist, propToCol will return the column key and we return an empty array (no selected rows)
	if (hot.propToCol('wpseBulkSelector') === 'wpseBulkSelector') {
		return [];
	}
	var selectedRows = hot.getDataAtCol(0);
	var selectedIds = [];

	selectedRows.forEach(function (isSelected, rowIndex) {
		if (isSelected) {
			selectedIds.push(hot.getDataAtRowProp(rowIndex, 'ID'));
		}
	});

	return selectedIds;
}
function vgseDeleteRowsById(rowIds) {
	loading_ajax(true);
	jQuery.post(vgse_global_data.ajax_url, {
		action: 'vgse_delete_row_ids',
		nonce: jQuery('#vgse-wrapper').data('nonce'),
		post_type: vgse_editor_settings.post_type,
		ids: rowIds
	}, function (response) {
		loading_ajax(false);
		if (response.success) {
			notification({ mensaje: response.data.message });
			vgseRemoveRowFromSheetByID(rowIds, true);
		} else {
			notification({ mensaje: response.data.message, tipo: 'error', tiempo: 60000 });
		}
	});
}
function vgseDecodeHtmlEntities(encodedString) {
    var parser = new DOMParser();
    var doc = parser.parseFromString('<div>' + encodedString + '</div>', 'text/html');
    return doc.body.firstChild.textContent;
}
// Prevent undefined $ errors
if (typeof window.$ === 'undefined') {
	window.$ = jQuery;
}

jQuery(document).ready(function (e) {

	// Prevent double initialization. A customer had a weird issue, some plugin was  
	// triggering the document ready event twice for an unknown reason, this is just a workaround.
	if (window.wpseHasInitialized) {
		return true;
	}
	var isSystemDarkMode = window.matchMedia &&
		window.matchMedia('(prefers-color-scheme: dark)') &&
		window.matchMedia('(prefers-color-scheme: dark)').matches;

	if (typeof vgse_editor_settings !== 'undefined' && vgse_editor_settings.is_backend && vgse_editor_settings.is_editor_page && ((isSystemDarkMode && !vgse_editor_settings.color_mode) || vgse_editor_settings.color_mode === 'dark')) {
		jQuery('html').addClass('vgse-dark-mode');
	}

	window.wpseHasInitialized = true;
	jQuery('body').on('click', '.wpse-toggle-head', function () {
		jQuery(this).next('.wpse-toggle-content').slideToggle();
	});

	jQuery('body').on('mouseenter', '[data-wpse-tooltip]', function () {
		var value = jQuery(this).attr('aria-label');
		if (value && /^\w+$/.test(value) && typeof vgse_editor_settings.texts[value] !== 'undefined') {
			jQuery(this).attr('aria-label', vgse_editor_settings.texts[value]);
		}
	});

	// Alpine.js requires this manual trigger to update the model, since it doesn't detect programmatic field value updates	
	jQuery('body').on('change', 'input[x-model],select[x-model],textarea[x-model]', function () {
		if (typeof Alpine !== 'undefined') {
			jQuery(this).get(0).dispatchEvent(new Event('input'));
		}
	});

	if (!jQuery('.be-spreadsheet-wrapper').length) {
		return true;
	}
	window.vgseFormulasBulkSelectorExists = jQuery('.remodal-bulk-edit').length;

	(function (Handsontable) {
		"use strict";

		var WPDurationEditor = Handsontable.editors.TextEditor.prototype.extend();

		WPDurationEditor.prototype.createElements = function () {
			Handsontable.editors.TextEditor.prototype.createElements.apply(this, arguments);
			this.TEXTAREA = document.createElement('input');
			this.TEXTAREA.setAttribute('type', 'time');
			this.TEXTAREA.setAttribute('step', 1);
			this.TEXTAREA.className = 'handsontableInput';
			this.textareaStyle = this.TEXTAREA.style;
			this.textareaStyle.width = 0;
			this.textareaStyle.height = 0;

			jQuery(this.TEXTAREA_PARENT).empty();
			this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
		};

		WPDurationEditor.prototype.focus = function () {
			// For IME editor textarea element must be focused using ".select" method. Using ".focus" browser automatically scrolls into the focused element, which is undesirable.
			this.TEXTAREA.select();
		};

		WPDurationEditor.prototype.getValue = function () {
			// Convert Hh:mm:ss to seconds
			var parts = this.TEXTAREA.value.split(':');
			if (parts.length === 3) {
				return (+parts[0]) * 60 * 60 + (+parts[1]) * 60 + (+parts[2]);
			}
			return '';
		};

		WPDurationEditor.prototype.setValue = function (value) {
			// Convert seconds to Hh:mm:ss if the value is a six-digit number
			if (typeof value === 'string' && /^\d+$/.test(value) && Number(value) >= 0 && Number(value) < 8640000) {
				var hours = Math.floor(value / 3600);
				var minutes = Math.floor((value % 3600) / 60);
				var seconds = value % 60;
				this.TEXTAREA.value = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
			} else {
				this.TEXTAREA.value = value;
			}
		};

		Handsontable.editors.WPDurationEditor = WPDurationEditor;
		Handsontable.editors.registerEditor('wp_duration', WPDurationEditor);

		function durationRenderer(instance, td, row, col, prop, value, cellProperties) {
			Handsontable.renderers.TextRenderer.apply(this, arguments);

			// Format the duration as "Hh:mm:ss"
			if (value) {
				var hours = Math.floor(value / 3600);
				var minutes = Math.floor((value % 3600) / 60);
				var seconds = value % 60;

				td.innerHTML = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
			} else {
				td.innerHTML = '';
			}
		}
		Handsontable.renderers.registerRenderer('wp_duration', durationRenderer);

	})(Handsontable);

	/**
	 * Time column editor
	 */
	(function (Handsontable) {
		"use strict";

		var WPTimeEditor = Handsontable.editors.TextEditor.prototype.extend();
		WPTimeEditor.prototype.createElements = function () {
			Handsontable.editors.TextEditor.prototype.createElements.apply(this, arguments);
			this.TEXTAREA = document.createElement('input');
			this.TEXTAREA.setAttribute('type', 'time');
			this.TEXTAREA.setAttribute('step', 1);
			this.TEXTAREA.className = 'handsontableInput';
			this.textareaStyle = this.TEXTAREA.style;
			this.textareaStyle.width = 0;
			this.textareaStyle.height = 0;

			jQuery(this.TEXTAREA_PARENT).empty();
			this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
		};

		WPTimeEditor.prototype.focus = function () {
			// For IME editor textarea element must be focused using ".select" method. Using ".focus" browser automatically scrolls into the focused element, which is undesirable.
			this.TEXTAREA.select();
		};

		Handsontable.editors.WPTimeEditor = WPTimeEditor;
		Handsontable.editors.registerEditor('wp_time', WPTimeEditor);
	})(Handsontable);

	/**
	 * Color picker column editor
	 */
	(function (Handsontable) {
		"use strict";

		var WPColorPickerEditor = Handsontable.editors.PasswordEditor.prototype.extend();
		WPColorPickerEditor.prototype.createElements = function () {
			Handsontable.editors.PasswordEditor.prototype.createElements.apply(this, arguments);
			this.TEXTAREA = document.createElement('input');
			this.TEXTAREA.setAttribute('type', 'color');
			this.TEXTAREA.className = 'handsontableInput';
			this.textareaStyle = this.TEXTAREA.style;
			this.textareaStyle.width = 0;
			this.textareaStyle.height = 0;

			jQuery(this.TEXTAREA_PARENT).empty();
			this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
		};
		WPColorPickerEditor.prototype.focus = function () {
			// For IME editor textarea element must be focused using ".select" method. Using ".focus" browser automatically scroll into
			// the focused element which is undesire effect.
			this.TEXTAREA.select();
		};

		Handsontable.editors.WPColorPickerEditor = WPColorPickerEditor;
		Handsontable.editors.registerEditor('wp_color_picker', WPColorPickerEditor);
	})(Handsontable);
	/**
	 * Date time column editor
	 */
	(function (Handsontable) {
		"use strict";

		var WPDateTimeEditor = Handsontable.editors.PasswordEditor.prototype.extend();
		WPDateTimeEditor.prototype.createElements = function () {
			Handsontable.editors.PasswordEditor.prototype.createElements.apply(this, arguments);
			this.TEXTAREA = document.createElement('input');
			this.TEXTAREA.setAttribute('type', 'datetime-local');
			this.TEXTAREA.className = 'handsontableInput';
			this.textareaStyle = this.TEXTAREA.style;
			this.textareaStyle.width = 0;
			this.textareaStyle.height = 0;

			jQuery(this.TEXTAREA_PARENT).empty();
			this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
		};
		WPDateTimeEditor.prototype.focus = function () {
			// For IME editor textarea element must be focused using ".select" method. Using ".focus" browser automatically scroll into
			// the focused element which is undesire effect.
			this.TEXTAREA.select();
		};

		WPDateTimeEditor.prototype.getValue = function () {
			var value = this.TEXTAREA.value;
			if (value) {
				var displayFormat = vgse_editor_settings.final_spreadsheet_columns_settings[this.prop].formatted.dateFormatJs;
				var m = moment.utc(value, 'YYYY-MM-DDTHH:mm:ss');
				value = m.format(displayFormat);
			}
			return value;
		};

		WPDateTimeEditor.prototype.setValue = function (newValue) {
			if (newValue) {
				var displayFormat = vgse_editor_settings.final_spreadsheet_columns_settings[this.prop].formatted.dateFormatJs;
				var m = moment.utc(newValue, displayFormat);
				newValue = m.format('YYYY-MM-DDTHH:mm:ss');
			}
			this.TEXTAREA.value = newValue;
		};

		Handsontable.editors.WPDateTimeEditor = WPDateTimeEditor;
		Handsontable.editors.registerEditor('wp_datetime', WPDateTimeEditor);
	})(Handsontable);

	(function (Handsontable) {

		function wpseChosenDropdownRenderer(instance, td, row, col, prop, value, cellProperties) {
			var selectedId;
			var optionsList = cellProperties.chosenOptions.data;

			if (typeof optionsList === "undefined" || typeof optionsList.length === "undefined" || !optionsList.length) {
				Handsontable.renderers.TextRenderer.apply(this, arguments);
				return td;
			}

			var values = (value + "").split(vgse_editor_settings.taxonomy_terms_separator).map(function (item) {
				return item.trim();
			});
			value = [];
			for (var index = 0; index < optionsList.length; index++) {

				if (values.indexOf(optionsList[index].id + "") > -1) {
					selectedId = optionsList[index].id;
					value.push(optionsList[index].label);
				}
			}
			value = value.join(vgse_editor_settings.taxonomy_terms_separator + ' ');

			Handsontable.renderers.TextRenderer.apply(this, arguments);
			return td;
		}

		// Register an alias
		Handsontable.renderers.registerRenderer('wp_chosen_dropdown', wpseChosenDropdownRenderer);

	})(Handsontable);
	(function (Handsontable) {
		function wpMediaGallery(hotInstance, td, row, column, prop, value, cellProperties) {
			// Optionally include `BaseRenderer` which is responsible for adding/removing CSS classes to/from the table cells.
			Handsontable.renderers.BaseRenderer.apply(this, arguments);

			var postType = jQuery('#post-data').data('post-type');
			var columnSettings = vgse_editor_settings.final_spreadsheet_columns_settings[prop];
			var multiple = typeof columnSettings.wp_media_multiple !== 'undefined' && columnSettings.wp_media_multiple;
			var postId = parseInt(hot.getDataAtRowProp(row, 'ID'));
			var urls = Handsontable.helper.stringify(value);
			var fileIds = [];
			var fileNames = [];

			urls.split(',').forEach(function (url) {
				fileIds.push(url.replace(/.+wpId=(\d+)$/, '$1').trim());

				var imageParts = url.split('/');
				fileNames.push(imageParts[imageParts.length - 1].replace(/(.+)\?wpId=(\d+)$/, '$1').trim());
			});


			if (columnSettings.formatted.readOnly) {
				var html = columnSettings.gallery_cell_html_template_readonly || '{preview}';
			} else {
				var html = columnSettings.gallery_cell_html_template_editable || '{preview}<button class="set_custom_images {multiple} button" data-type="{data_type}" data-file="{file_ids}" data-key="{prop}" data-id="{post_id}"><i class="fa fa-upload"></i></button>{multiple_previews_button}{value_teaser}';
			}

			var previewHtml = '';
			// Show preview only if it's one image and the file extension is an image
			if (urls && urls.indexOf(',') < 0) {
				// If this is a local URL, check without query strings; if it's external, keep query strings because a query string might contain the mime type
				var urlsForMimeCheck = urls.indexOf(window.location.protocol + '//' + window.location.host) === 0 ? urls.replace(/\?.+/, '') : urls;
				var urlParts = urlsForMimeCheck.split('.');
				var fileExtension = urlParts[urlParts.length - 1].toLowerCase();
				if (urls.indexOf('http') > -1 && ['png', 'jpg', 'jpeg', 'gif', 'webp'].indexOf(fileExtension) > -1) {
					var previewHtml = vgse_editor_settings.media_cell_preview_template.replace('{url}', urls);
				}
			}
			html = html.replace('{preview}', previewHtml);

			if (!columnSettings.formatted.readOnly) {
				html = html.replace('{multiple}', multiple ? 'multiple' : '');
				html = html.replace('{data_type}', columnSettings.data_type);
				html = html.replace('{file_ids}', fileIds.join(','));
				html = html.replace('{prop}', prop);
				html = html.replace('{post_id}', postId);

				var multiplePreviewsButton = (multiple && urls) ? ' <a href="#image" data-remodal-target="image" class="view_custom_images multiple button" data-type="' + columnSettings.data_type + '" data-key="' + prop + '" data-id="' + postId + '"><i class="fa fa-image"></i></a>' : '';
				html = html.replace('{multiple_previews_button}', multiplePreviewsButton);
			}

			if (!vgse_editor_settings.dont_display_file_names_image_columns) {
				if (value) {
					var charactersLimit = 40;
					var fileNamesString = fileNames.join(', ');
					var valueTeaser = vgseStripHtml(fileNamesString.substring(0, charactersLimit));

					if (fileNamesString.length > charactersLimit) {
						valueTeaser += '...';
					}
				} else {
					valueTeaser = '(' + vgse_editor_settings.texts.empty + ')';
				}

				html = html.replace('{value_teaser}', valueTeaser);
			}

			if (columnSettings.formatted.readOnly) {
				html = '<i class="fa fa-lock vg-cell-blocked"></i> ' + html;
				html = html.replace(/set_custom_images|view_custom_images/g, '');
			}

			td.innerHTML = html;
			return td;
		}

		// Register an alias
		Handsontable.renderers.registerRenderer('wp_media_gallery', wpMediaGallery);

	})(Handsontable);

	(function (Handsontable) {
		function wpTinyMCE(hotInstance, td, row, column, prop, value, cellProperties) {
			// Optionally include `BaseRenderer` which is responsible for adding/removing CSS classes to/from the table cells.
			Handsontable.renderers.BaseRenderer.apply(this, arguments);

			var postType = jQuery('#post-data').data('post-type');
			var columnSettings = vgse_editor_settings.final_spreadsheet_columns_settings[prop];

			if (typeof columnSettings.formatted.wpse_template_key === 'undefined') {
				columnSettings.formatted.wpse_template_key = 'tinymce_cell_template';
			}

			var html = vgse_editor_settings[columnSettings.formatted.wpse_template_key];
			var postId = parseInt(hot.getDataAtRowProp(row, 'ID'));
			var rowTitle = vgseGetRowTitle(row) || String(postId);
			var html = html.replace(/\{key\}/g, prop);
			var html = html.replace(/\{type\}/g, columnSettings.data_type);
			var html = html.replace(/\{id\}/g, postId);

			if (typeof rowTitle === 'string') {
				var html = html.replace(/\{post_title\}/g, rowTitle.replace(/"/g, ''));
			}

			if (value) {
				var charactersLimit = vgse_editor_settings.tinymce_preview_characters_limit;
				html += vgseStripHtml(value).substring(0, charactersLimit);

				if (value.length > charactersLimit) {
					html += '...';
				}
			} else {
				html += '(' + vgse_editor_settings.texts.empty + ')';
			}

			if (columnSettings.formatted.readOnly) {
				html = '<i class="fa fa-lock vg-cell-blocked"></i> ' + html;
				html = html.replace(/btn-popup-content/g, '');
			}

			td.innerHTML = html;
			return td;
		}

		// Register an alias
		Handsontable.renderers.registerRenderer('wp_tinymce', wpTinyMCE);

	})(Handsontable);

	(function (Handsontable) {
		function wpHandsontable(hotInstance, td, row, column, prop, value, cellProperties) {
			// Optionally include `BaseRenderer` which is responsible for adding/removing CSS classes to/from the table cells.
			Handsontable.renderers.BaseRenderer.apply(this, arguments);

			var postType = jQuery('#post-data').data('post-type');
			var columnSettings = vgse_editor_settings.final_spreadsheet_columns_settings[prop];
			var html = vgse_editor_settings.handsontable_cell_template;
			var postId = parseInt(hot.getDataAtRowProp(row, 'ID'));

			var html = html.replace(/\{key\}/g, prop);
			var html = html.replace(/\{type\}/g, columnSettings.data_type);
			var html = html.replace(/\{id\}/g, postId);

			var rowTitle = vgseGetRowTitle(row) || String(postId);
			var html = html.replace(/\{post_title\}/g, rowTitle.replace(/"/g, ''));


			var fullData = hot.getSourceData();
			var modalSettings = jQuery.extend(true, columnSettings, fullData[row]);
			modalSettings.post_id = postId;

			var html = html.replace(/\{modal_settings\}/g, vgseEscapeHTML(JSON.stringify(modalSettings)));
			var html = html.replace(/\{value\}/g, vgseEscapeHTML(JSON.stringify(value)));

			var html = html.replace(/\{button_label\}/g, modalSettings.edit_button_label);

			if (value && value !== '[]') {
				html += ' ...';
			} else {
				html += ' (' + vgse_editor_settings.texts.empty + ')';
			}

			if (columnSettings.formatted.readOnly) {
				html = '<i class="fa fa-lock vg-cell-blocked"></i> ' + html;
				html = html.replace(/(btn-popup-content|button-custom-modal-editor|button-handsontable)/g, '');
			}

			td.innerHTML = html;
			return td;
		}

		// Register an alias
		Handsontable.renderers.registerRenderer('wp_handsontable', wpHandsontable);

	})(Handsontable);
	(function (Handsontable) {
		function wpseFriendlySelect(hotInstance, td, row, column, prop, value, cellProperties) {
			// Optionally include `BaseRenderer` which is responsible for adding/removing CSS classes to/from the table cells.
			Handsontable.renderers.BaseRenderer.apply(this, arguments);

			var columnSettings = vgse_editor_settings.final_spreadsheet_columns_settings[prop];
			var html = value;

			if (typeof value === 'string' && typeof columnSettings.formatted.selectOptions[value] !== 'undefined') {
				var html = columnSettings.formatted.selectOptions[value];
			}
			td.textContent = vgseDecodeHtmlEntities(html);
			return td;
		}

		// Register an alias
		Handsontable.renderers.registerRenderer('wp_friendly_select', wpseFriendlySelect);

	})(Handsontable);
	(function (Handsontable) {
		function wpExternalButtonCell(hotInstance, td, row, column, prop, value, cellProperties) {
			// Optionally include `BaseRenderer` which is responsible for adding/removing CSS classes to/from the table cells.
			Handsontable.renderers.BaseRenderer.apply(this, arguments);

			var columnSettings = vgse_editor_settings.final_spreadsheet_columns_settings[prop];

			if (value) {
				var html = '<a target="_blank" href="' + value + '" class="button"><i class="fa fa-external-link"></i> ' + columnSettings.title + '</a>';
			} else {
				html = '';
			}
			td.innerHTML = html;
			return td;
		}

		// Register an alias
		Handsontable.renderers.registerRenderer('wp_external_button', wpExternalButtonCell);

	})(Handsontable);

	(function (Handsontable) {
		function wpLockedCell(hotInstance, td, row, column, prop, value, cellProperties) {
			// Optionally include `BaseRenderer` which is responsible for adding/removing CSS classes to/from the table cells.
			Handsontable.renderers.BaseRenderer.apply(this, arguments);

			var postType = jQuery('#post-data').data('post-type');
			var columnSettings = vgse_editor_settings.final_spreadsheet_columns_settings[prop];

			if (!columnSettings.lock_template_key) {
				columnSettings.lock_template_key = 'lock_cell_template';
			}

			// Limit value length and convert to plain text
			if (typeof value === 'string') {
				var charactersLimit = vgse_editor_settings.max_value_length_locked_cells || 55;
				value = vgseStripHtml(value).substring(0, charactersLimit);

				if (value.length > charactersLimit) {
					value += '...';
				}
				var value = value.replace(/\n/g, "<br>");
			}

			if (typeof value === 'string' && value.indexOf('vg-cell-blocked') > -1) {
				var html = value;
			} else {
				var html = vgse_editor_settings[columnSettings.lock_template_key];

				var html = html.replace(/\{key\}/g, prop);
				var html = html.replace(/\{value\}/g, value);
				var html = html.replace(/\{post_type\}/g, postType);
				var html = html.replace(/set_custom_images|view_custom_images|button-handsontable|button-custom-modal-editor|data-remodal-target="image"/g, '');
			}

			td.innerHTML = html;
			return td;
		}

		// Register an alias
		Handsontable.renderers.registerRenderer('wp_locked', wpLockedCell);

	})(Handsontable);

	if (jQuery('.wpse-full-screen-notice').length) {
		vgseToggleFullScreen(parseInt(jQuery('.wpse-full-screen-notice').data('status')));
		jQuery('body').on('click', '.wpse-full-screen-toggle', function (e) {
			e.preventDefault();
			vgseToggleFullScreen();
		});
	}

	jQuery('body').on('click', '.dismiss-review-tip', function (e) {
		if (!jQuery(this).attr('href')) {
			e.preventDefault();
		}

		// Reset the text variable so we don't ask for a review again in the same session
		vgse_editor_settings.texts.ask_review = '';
		jQuery(this).parent('.review-tip').remove();
		var nonce = jQuery('.remodal-bg').data('nonce');

		// Don't request reviews on future sessions
		jQuery.ajax({
			type: "POST",
			url: vgse_global_data.ajax_url,
			data: { action: "vgse_dismiss_review_tip", nonce: nonce },
			dataType: 'json',
		});
	});


	jQuery('.wpse-stuck-loading').appendTo('body');
	jQuery('body').on('click', '.wpse-stuck-loading button', function (e) {
		e.preventDefault();
		loading_ajax(false);

		if (window.beLastLoadRowsAjax) {
			window.beLastLoadRowsAjax.abort();
		}
		jQuery('.wpse-stuck-loading').hide();
	});


	// Image previews
	jQuery('.vi-preview-wrapper').appendTo('body');
	jQuery('body').on('mouseleave', '.vi-preview-img', function (e) {
		console.log(jQuery(this));
		jQuery('.vi-preview-wrapper').hide();
	});
	jQuery('body').on('mouseenter', '.vi-preview-img', function (e) {
		console.log(jQuery(this));
		var $img = jQuery(this).first();
		var img = jQuery(this)[0].outerHTML;

		if ($img.attr('src').indexOf('wpse_no_zoom') > -1) {
			return true;
		}

		var imgTag = '<img src="' + $img.attr('src') + '" />';
		console.log(img);
		console.log('imgTag: ', imgTag);
		var $wrapper = jQuery('.vi-preview-wrapper');
		var largeImageAtTheLeft = (jQuery(window).width() - $wrapper.width()) < ($img.offset().left + $img.width() - jQuery(document).scrollLeft());

		if (largeImageAtTheLeft) {
			$wrapper.css({
				right: 'auto',
				left: '0px'
			});
		} else {
			$wrapper.css({
				right: '0px',
				left: 'auto'
			});
		}

		$wrapper.empty();
		$wrapper.show();

		$wrapper.append(imgTag);
	});



	// go to the top
	jQuery('#go-top').on('click', function (e) {
		e.preventDefault();
		var body = jQuery("html, body");
		body.stop().animate({ scrollTop: 0 }, '300', 'swing', function () {
		});
	});


	// Add #ohsnap element, which contains the user notifications
	jQuery('body').append('<div id="ohsnap" style="z-index: -1"></div>');

	// Init labelauty, which converts checkboxes into switch buttons
	var $wrapper = jQuery('#vgse-wrapper');

	if ($wrapper.length) {
		$wrapper.find(".vg-toolbar input:checkbox").labelauty();
	}


	/* internal variables */
	var
		$container = jQuery("#post-data"),
		$console = jQuery("#responseConsole"),
		$parent = jQuery('#vgse-wrapper'),
		autosaveNotification,
		maxed = false,
		hot;

	// is cells formatting enabled
	if (jQuery('#formato').is(':checked')) {
		format = false;
	} else {
		format = true;
	}

	// Initialize select2 on selects

	setTimeout(function () {
		vgseInitSelect2();
	}, 2000);

	// Handsontable settings
	var handsontableArgs = {
		comments: vgse_editor_settings.allow_cell_comments,
		colWidths: vgObjectToArray(vgse_editor_settings.colWidths),
		colHeaders: vgObjectToArray(vgse_editor_settings.colHeaders),
		columns: columns_format(format),
		rowHeaders: true, //Cabeceras
		startRows: vgse_editor_settings.startRows, //Cantidad de filas
		startCols: vgse_editor_settings.startCols, //Cantidad de columnas
		currentRowClassName: 'currentRow',
		currentColClassName: 'currentCol',
		fillHandle: false,
		columnSorting: true,
		manualColumnFreeze: true,
		manualColumnMove: true,
		contextMenu: {
			items: {
				'undo': {},
				'redo': {},
				'separator1': {
					name: '---------'
				},
				'copy': {},
				'cut': {},
				'how_to_paste': {
					name: vgse_editor_settings.texts.how_to_paste
				},
				'separator2': {
					name: '---------'
				},
				'make_read_only': {},
				'freeze_column': {},
				'unfreeze_column': {},
				'delete_row': {
					name: vgse_editor_settings.texts.delete_row,
					hidden: function () {
						if (!hot.getSelected()) {
							return true;
						}
						return !vgse_editor_settings.can_delete_row;
					},
					callback: function (key, selection, clickEvent) {
						var rowIds = [];
						var rowIndex = [];
						selection.forEach(function (range) {
							if (range.start.row < range.end.row) {
								vgseRange(range.start.row, range.end.row).forEach(function (index) {
									rowIndex.push(index);
								});
							} else {
								rowIndex.push(range.start.row);
							}
						});

						rowIndex.forEach(function (index) {
							rowIds.push(hot.getDataAtRowProp(index, 'ID'));
						});

						if (rowIds.length > 5) {
							var $modal = jQuery('.confirm-bulk-delete-rows-modal');
							$modal.data('rowIds', rowIds);
							$modal.remodal().open();
						} else {

							if (!confirm(vgse_editor_settings.texts.confirm_delete_row.replace('{rows_number}', rowIds.length))) {
								return true;
							}
							vgseDeleteRowsById(rowIds);
							hot.deselectCell();
						}
					}
				},
				/*'realign_cells': {
				 name: vgse_editor_settings.texts.realign_cells,
				 callback: function (key, selection, clickEvent) {
				 hot.render();
				 }
				 },*/
				'resize_columns': {
					name: vgse_editor_settings.texts.auto_resize_columns,
					callback: function (key, selection, clickEvent) {
						// The autoColumnSize plugin works only if colWidths is not set
						hot.updateSettings({
							colWidths: null
						});
						hot.updateSettings({
							autoColumnSize: true
						});
						var autoColumnSizePlugin = hot.getPlugin('autoColumnSize');
						autoColumnSizePlugin.recalculateAllColumnsWidth();
						autoColumnSizePlugin.widths;
						var finalSizes = [];
						autoColumnSizePlugin.widths.forEach(function (size) {
							finalSizes.push(size + 25);
						});
						hot.updateSettings({
							colWidths: finalSizes,
							autoColumnSize: false
						});
						hot.runHooks('afterColumnResize');
					}
				},
				'open_regular_editor': {
					name: vgse_editor_settings.texts.open_regular_editor,
					hidden: function () {
						return vgse_editor_settings.is_administrator && typeof vgse_editor_settings.final_spreadsheet_columns_settings.open_wp_editor !== 'object';
					},
					callback: function (key, selection, clickEvent) {
						console.log(key);
						var rowIds = [];
						var rowIndex = [];
						selection.forEach(function (range) {
							if (range.start.row < range.end.row) {
								vgseRange(range.start.row, range.end.row).forEach(function (index) {
									rowIndex.push(index);
								});
							} else {
								rowIndex.push(range.start.row);
							}
						});

						rowIndex.forEach(function (index) {
							rowIds.push(hot.getDataAtRowProp(index, 'ID'));
						});

						var url = vgse_editor_settings.final_spreadsheet_columns_settings.open_wp_editor.external_button_template.replace('{ID}', rowIds[0]);
						window.open(url, '_blank');
					}
				},
				'view': {
					name: vgse_editor_settings.texts.view_row,
					hidden: function () {
						return typeof vgse_editor_settings.final_spreadsheet_columns_settings.view_post !== 'object';
					},
					callback: function (key, selection, clickEvent) {
						console.log(key);
						var rowIndex = [];
						selection.forEach(function (range) {
							if (range.start.row < range.end.row) {
								vgseRange(range.start.row, range.end.row).forEach(function (index) {
									rowIndex.push(index);
								});
							} else {
								rowIndex.push(range.start.row);
							}
						});

						let firstUrl = null;
						rowIndex.forEach(function (index) {
							if(!firstUrl){
								firstUrl = hot.getDataAtRowProp(index, 'view_post');
							}
						});

						if(firstUrl){
							window.open(firstUrl, '_blank');
						}
					}
				},
			}
		},
		autoWrapRow: true,
		autoRowSize: false,
		autoColumnSize: false,
		outsideClickDeselects: false,
		viewportRowRenderingOffset: 20,
		viewportColumnRenderingOffset: vgse_editor_settings.media_cell_preview_max_height > 22 ? 500 : 4,
		wordWrap: true,
		minSpareCols: 0,
		minSpareRows: 0,
		width: null,
		height: null,
		copyPaste: {
			rowsLimit: 999999, // maximum number of rows that can be copied
			columnsLimit: 999999, // maximum number of columns that can be copied
		},
		afterChange: _throttle(function (changes) {
			console.log('Change detected, enabled saving: ', new Date(), '. changes: ', changes);
			var hasChanged = false;

			if (changes && changes.length) {
				changes.forEach(function (change) {
					if (window.vgseFormulasBulkSelectorExists && (change[1] === 0 || change[1] === "wpseBulkSelector")) {
						return true;
					}
					if (change[2] !== change[3]) {
						hasChanged = true;
						return true;
					}
				});
			}
			if (hasChanged) {
				beSetSaveButtonStatus(true);
			}
		}, 3000, {
			leading: true,
			trailing: true
		}),
		beforeCopy: function (data, coords) {
			// data -> [[1, 2, 3], [4, 5, 6]]
			// coords -> [{startRow: 0, startCol: 0, endRow: 1, endCol: 2}]

			data.forEach(function (row, rowIndex) {
				row.forEach(function (cell, cellIndex) {
					if (typeof cell === 'string' && cell.indexOf('vg-cell-blocked') > -1) {
						data[rowIndex][cellIndex] = vgseStripHtml(cell).trim();
					}
				});
			});
			return data;
		},
		afterDocumentKeyDown: function (e) {
			var stopPropagation = false;
			if (e.key === 'ArrowDown') {
				var selected = hot.getSelected();
				var maxRowIndex = hot.countRows() - 1;
				// Exit if we press the arrowDown key and we are in the last row already
				if (selected && selected[0][0] === maxRowIndex && selected[0][2] === maxRowIndex) {
					stopPropagation = true;
				}
			}
			if (e.key === 'ArrowUp') {
				var selected = hot.getSelected();
				// Exit if we press the ArrowUp key and we are in the first row already
				if (selected && selected[0][0] === 0 && selected[0][2] === 0) {
					stopPropagation = true;
				}
			}
			if (e.key === 'ArrowRight') {
				var selected = hot.getSelected();
				var maxColumnIndex = hot.countCols() - 1;
				// Exit if we press the ArrowRight key and we are in the last column already
				if (selected && selected[0][3] === maxColumnIndex) {
					stopPropagation = true;
				}
			}
			if (e.key === 'ArrowLeft') {
				var selected = hot.getSelected();
				// Exit if we press the ArrowLeft key and we are in the first column already
				if (selected && selected[0][1] === 0) {
					stopPropagation = true;
				}
			}
			if (stopPropagation) {
				e.stopImmediatePropagation();
				e.stopPropagation();
				e.preventDefault();
				// We must return the event object. If we return false, Handsontable will run its callbacks and unset the last cell value
				return e;
			}
		}
	};

	if (vgse_editor_settings.is_premium) {
		handsontableArgs.contextMenu.items['show_column_key'] = {
			name: vgse_editor_settings.texts.show_column_key,
			callback: function (key, selection, clickEvent) {
				var columnKey = hot.colToProp(selection[0].start.col);
				alert(vgse_editor_settings.texts.column_key_description + ': $' + columnKey + '$');
			}
		};
	}

	if (vgse_editor_settings.debug) {
		handsontableArgs.debug = vgse_editor_settings.debug;
	}

	var customHandsontableArgs = (vgse_editor_settings.custom_handsontable_args) ? JSON.parse(vgse_editor_settings.custom_handsontable_args) : {};
	var finalHandsontableArgs = jQuery.extend(handsontableArgs, customHandsontableArgs);

	var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
	if (isTouch) {
		finalHandsontableArgs.width = jQuery(window).width();
		finalHandsontableArgs.height = jQuery(window).height();
		if (jQuery(window).width() < 600) {
			finalHandsontableArgs.fixedColumnsLeft = false;
		}
	}
	hot = new Handsontable($container[0], finalHandsontableArgs);


	beSetSaveButtonStatus(false);
	window.hot = hot;
	window.beFoundRows = 0;

	jQuery('.confirm-bulk-delete-rows-modal input').on('keyup', function (event) {
		event.preventDefault();
		var $input = jQuery(this);
		if (event.keyCode === 13 && $input.val() && $input.val().toLowerCase() === 'delete' && jQuery('.confirm-bulk-delete-rows-modal').data('rowIds')) {
			vgseDeleteRowsById(jQuery('.confirm-bulk-delete-rows-modal').data('rowIds'));
			$input.val('');
			jQuery('.confirm-bulk-delete-rows-modal').data('rowIds', false);
			jQuery('.confirm-bulk-delete-rows-modal').remodal().close();
		}
	});

	jQuery(document).on('opened', '.confirm-bulk-delete-rows-modal', function (e) {
		var rowIds = jQuery(this).data('rowIds');
		jQuery(this).find('.contains-variable span').text(rowIds.length);
	});

	/**
	 * Load initial posts
	 */
	$parent.find('button[name=load]').on('click', function () {
		var nonce = jQuery('.remodal-bg').data('nonce');

		beLoadPosts({
			post_type: $container.data('post-type'),
			nonce: nonce
		});

	});

	// Load rows after 400ms to give time to other plugins to hook into the loading process
	if (!vgse_editor_settings.disable_automatic_loading_rows) {
		setTimeout(function () {
			jQuery('body').trigger('vgSheetEditor/beforeIntialLoadingRows');
			$parent.find('button[name=load]').click();
		}, 400);
	}

	/*
	 * If there are no posts, show tooltip asking to create posts
	 */
	jQuery('body').on('vgSheetEditor:beforeRowsInsert', function (event, response) {
		console.log('beforeRowsInsert');
		console.log(response);

		if (!response.success) {
			vgseCustomTooltip(jQuery('.sheet-header .add_rows-container'), vgse_editor_settings.texts.add_posts_here, null, false, 'success');
		}
	});

	/**
	 * Save changes
	 */
	if (vgse_editor_settings.enable_auto_saving) {
		setInterval(function () {
			if (jQuery('.wpse-save.disabled').length || window.wpseAutoSavingInProgress) {
				return true;
			}

			// Show the "Saving..." indicator in the toolbar
			var $saveStatusIndicator = jQuery('.button-container.auto_saving_status-container a');
			$saveStatusIndicator.text($saveStatusIndicator.data('saving-changes'));

			// Don't autosave again when we are already saving
			window.wpseAutoSavingInProgress = true;

			// Start saving in the background
			jQuery('body').find('.be-start-saving').click();

		}, 1000 * 60 * 2);
	}


	// Close modal when clicking the cancel button
	jQuery('.bulk-save.remodal').find('.remodal-cancel').on('click', function (e) {
		var modalInstance = jQuery('[data-remodal-id="bulk-save"]').remodal();
		modalInstance.close();
		jQuery('html,body').scrollLeft(0)
	});
	/**
	 * Change from "saving" state to "confirm before saving" state after closing the modal
	 */
	jQuery('.bulk-save.remodal .bulk-saving-screen').find('.remodal-cancel').on('click', function (e) {
		jQuery('html,body').scrollLeft(0)

		var $button = jQuery(this);
		var $modal = $button.parents('.remodal');

		$modal.find('.be-saving-warning').show();
		$modal.find('.bulk-saving-screen').hide();
		$modal.find('#be-nanobar-container').empty();
		$button.addClass('hidden');
		$modal.find('.response').empty();
	});
	/**
	 * Change from "confirm before saving" state to "saving" on save modal
	 */
	jQuery(document).on('opening', '[data-remodal-id="bulk-save"]', function () {
		if (vgse_editor_settings.user_has_saved_sheet) {
			jQuery('body').find('.be-start-saving').click();
		}
	});
	// Keyboard shortcut: ctrl + s for quick saving when a modal is not opened
	document.addEventListener('keydown', function (e) {
		if (e.key && e.key.toLowerCase() === 's' && e.ctrlKey && !jQuery('.remodal-is-opened').length) {
			e.preventDefault();
			hot.deselectCell();
			jQuery('.wpse-save').trigger('click');
		}
	});
	jQuery('body').on('click', '.wpse-save.disabled, .wpse-save-later.disabled', function (e) {
		e.preventDefault();
		notification({ mensaje: vgse_editor_settings.texts.no_changes_to_save, tipo: 'info' });
	});
	jQuery('.bulk-save.remodal').find('.remodal-confirm').on('click', function (e) {
		var $button = jQuery(this);
		var $modal = $button.parents('.remodal');

		$modal.find('.be-saving-warning').show();
		$modal.find('.bulk-saving-screen').hide();
		$modal.find('#be-nanobar-container').empty();
		$modal.find('.response').empty();
	});
	/**
	 * Save changes - Start saving
	 */
	jQuery('body').find('.be-start-saving').on('click', function (e) {
		e.preventDefault();

		// Mark flag to not show the safety notifications because the 
		// user already knows how to save changes
		vgse_editor_settings.user_has_saved_sheet = 1;

		// Hide warning and start saving screen

		var $warning = jQuery(this).parents('.be-saving-warning');
		var $progress = $warning.next();

		$progress.find('.be-loading-anim').show();
		$warning.fadeOut();
		$progress.fadeIn();

		console.log($warning);
		console.log($progress);



		// Get posts that need saving
		var fullData = hot.getSourceData();

		fullData = beGetModifiedItems(fullData, window.beOriginalData);

		console.log(fullData);
		console.log(!fullData);

		// No posts to save found
		if (!fullData.length) {

			jQuery($progress).find('.response').append('<p>' + vgse_editor_settings.texts.no_changes_to_save + '</p>');
			loading_ajax(false);

			$progress.find('.remodal-cancel').removeClass('hidden');
			$progress.find('.be-loading-anim').hide();

			vgseAllowToClosePageWithoutWarning(true);
			setTimeout(function () {
				beSetSaveButtonStatus(false);
				$progress.find('.remodal-cancel').click();
			}, 500);
			notification({ mensaje: vgse_editor_settings.texts.no_changes_to_save, tipo: 'info' });
			return true;
		}

		if (typeof vgseHooks !== 'undefined') {
			var errors = vgseHooks().applyFilters('vgSheetEditor_save_precheckErrors', [], fullData);
			if (errors.length) {
				jQuery($progress).find('.response').empty();
				errors.forEach(function (error) {
					jQuery($progress).find('.response').append('<p>' + error + '</p>');
				});
				loading_ajax(false);

				$progress.find('.remodal-cancel').removeClass('hidden');
				$progress.find('.be-loading-anim').hide();
				console.log('Errors: ', errors);
				return true;
			}
		}


		var nonce = jQuery('.remodal-bg').data('nonce');


		// Init progress bar
		var options = {
			classname: 'be-progress-bar',
			id: 'be-progress-bar',
			target: document.getElementById('be-nanobar-container')
		};

		var nanobar = new Nanobar(options);
		// We start progress bar with 1% so it doesn't look completely empty
		nanobar.go(1);

		var totalCalls = Math.ceil(fullData.length / parseInt(vgse_editor_settings.save_posts_per_page));

		jQuery('.saving-now-message').show();
		if (totalCalls > 1) {
			setTimeout(function () {
				if (!jQuery('.saving-complete-message').length) {
					jQuery('.tip-saving-speed-message').show();
				}
			}, 5500);
		}
		var $saveStatusIndicator = jQuery('.button-container.auto_saving_status-container a');


		// Start saving posts, start ajax loop
		beAjaxLoop({
			totalCalls: totalCalls,
			url: vgse_global_data.ajax_url,
			dataType: 'json',
			method: 'POST',
			data: {
				'data': [],
				'post_type': $container.data('post-type'),
				'action': 'vgse_save_data',
				'nonce': nonce,
				'filters': beGetRowsFilters(),
				'wpse_source_suffix': vgse_editor_settings.wpse_source_suffix || ''
			},
			prepareData: function (data, settings) {
				var dataParts = fullData.chunk(parseInt(vgse_editor_settings.save_posts_per_page));

				data.data = dataParts[settings.current - 1];

				return data;
			},
			onSuccess: function (res, settings) {


				// if the response is empty or has any other format,
				// we create our custom false response
				if (!res || (res.success !== true && !res.data)) {
					res = {
						data: {
							message: vgse_editor_settings.texts.http_error_try_now
						},
						success: false,
						allowRetry: true
					};
				}

				// If error
				if (!res.success) {
					jQuery('.tip-saving-speed-message').hide();

					// show error message
					jQuery($progress).find('.response').append('<p>' + res.data.message + '</p>');

					// Ask the user if he wants to retry the same post
					var goNext = res.allowRetry ? confirm(res.data.message) : false;

					// stop saving if the user chose to not try again
					if (!goNext) {
						if (vgse_editor_settings.enable_auto_saving) {
							jQuery($progress).find('.response').append(vgse_editor_settings.texts.auto_saving_stop_error);
						} else {
							jQuery($progress).find('.response').append(vgse_editor_settings.texts.saving_stop_error);
						}
						$progress.find('.remodal-cancel').removeClass('hidden');
						$progress.find('.be-loading-anim').hide();
						jQuery('.bulk-saving-screen .response').scrollTop(jQuery('.bulk-saving-screen .response')[0].scrollHeight);
						if (vgse_editor_settings.enable_auto_saving) {
							$saveStatusIndicator.text($saveStatusIndicator.data('unsaved-changes'));
							if (!jQuery('[data-remodal-id="bulk-save"]').is(':visible')) {
								jQuery('[data-remodal-id="bulk-save"]').remodal().open();
							}
						}
						return false;
					}
					// reset pointer to try the same batch again
					settings.current--;
					jQuery('.bulk-saving-screen .response').scrollTop(jQuery('.bulk-saving-screen .response')[0].scrollHeight);
					return true;
				}

				nanobar.go(settings.current / settings.totalCalls * 100);

				// Remove rows of posts deleted
				if (res.data.deleted.length) {
					vgseRemoveRowFromSheetByID(res.data.deleted);
				}

				// Display message saying the number of posts saved so far
				var updated = (parseInt(vgse_editor_settings.save_posts_per_page) * settings.current > fullData.length) ? fullData.length : parseInt(vgse_editor_settings.save_posts_per_page) * settings.current;
				var text = vgse_editor_settings.texts.paged_batch_saved.replace('{updated}', updated);
				var text = text.replace('{total}', fullData.length);
				jQuery($progress).find('.response').append('<p>' + text + '</p>');

				// is complete, show notification to user, hide loading screen, and display "close" button
				if (settings.current === settings.totalCalls) {

					jQuery('.tip-saving-speed-message, .saving-now-message').hide();
					var successMessage = vgse_editor_settings.texts.everything_saved;

					if (vgse_editor_settings.texts.ask_review) {
						successMessage += '<br>' + vgse_editor_settings.texts.ask_review;
					}
					jQuery($progress).find('.response').empty().append('<p class="saving-complete-message">' + successMessage + '</p>');

					loading_ajax(false);


					notification({ mensaje: vgse_editor_settings.texts.everything_saved });

					$progress.find('.remodal-cancel').removeClass('hidden');
					$progress.find('.be-loading-anim').hide();

					jQuery('body').trigger('vgSheetEditor/afterSavingChanges');

					vgseAllowToClosePageWithoutWarning(true);

					beSetSaveButtonStatus(false);

					// Reset original data cache, so the modified cells that we save are not considered modified anymore.
					window.beOriginalData = jQuery.extend(true, [], hot.getSourceData());

					// Remove all the posts with status=delete that were deleted.
					hot.getSourceData().forEach(function (item, id) {
						if (typeof item.post_status !== 'undefined' && item.post_status === 'delete') {
							hot.alter('remove_row', id);
						}
					});

					// automatically close the popup if everything was saved in one batch and the modal is visible (not background save)
					if (settings.totalCalls === 1 && jQuery('[data-remodal-id="bulk-save"]').is(':visible')) {
						// Some servers are super fast and save before the popup has 
						// opened, so the popup gets stuck as opened
						setTimeout(function () {
							var modalInstance = jQuery('[data-remodal-id="bulk-save"]').remodal();
							modalInstance.close();
						}, 500);
					}

					if (vgse_editor_settings.enable_auto_saving) {
						var $saveStatusIndicator = jQuery('.button-container.auto_saving_status-container a');
						$saveStatusIndicator.text($saveStatusIndicator.data('saved-changes'));
					}
				} else {

				}

				// Move scroll to the button to show always the last message in the saving status section
				setTimeout(function () {
					jQuery('.bulk-saving-screen .response').scrollTop(jQuery('.bulk-saving-screen .response')[0].scrollHeight);
				}, 600);

				return true;
			},
			onError: function (jqXHR, textStatus, settings) {
				console.log('error cb');

				// Ask the user if he wants to retry the same post
				var retryText = vgse_editor_settings.enable_auto_saving ? vgse_editor_settings.texts.auto_saving_http_error_try_now : vgse_editor_settings.texts.http_error_try_now;
				var goNext = confirm(retryText);
				$progress.find('.be-loading-anim').hide();

				// stop saving if the user chose to not try again
				if (!goNext) {
					if (vgse_editor_settings.enable_auto_saving) {
						jQuery($progress).find('.response').append(vgse_editor_settings.texts.auto_saving_stop_error);
					} else {
						jQuery($progress).find('.response').append(vgse_editor_settings.texts.saving_stop_error);
					}
					$progress.find('.remodal-cancel').removeClass('hidden');
					jQuery('.bulk-saving-screen .response').scrollTop(jQuery('.bulk-saving-screen .response')[0].scrollHeight);

					if (vgse_editor_settings.enable_auto_saving) {
						$saveStatusIndicator.text($saveStatusIndicator.data('unsaved-changes'));
					}
					return false;
				}
				window.vgseDontNotifyServerError = true;
				// reset pointer to try the same batch again
				settings.current--;
				nanobar.go(settings.current / settings.totalCalls * 100);
				jQuery('.bulk-saving-screen .response').scrollTop(jQuery('.bulk-saving-screen .response')[0].scrollHeight);
				return true;

			}
		});
	});

	/**
	 * Save image cells, single image
	 */
	if (typeof wp !== 'undefined' && wp.media) {
		jQuery('body').on('click', '.set_custom_images:not(.multiple)', function (e) {
			e.preventDefault();
			loading_ajax(true);
			var button = jQuery(this);
			var $cell = button.parent('td');
			var cellCoords = hot.getCoords($cell[0]);
			console.log(hot.getDataAtCell(cellCoords.row, cellCoords.col));
			var scrollLeft = jQuery('html,body').scrollLeft();
			var id = button.data('id');
			var key = button.data('key');
			var type = button.data('type');
			var file = button.data('file');
			var gallery = [];

			var scrollTop = jQuery(document).scrollTop();
			var currentInfiniteScrollStatus = jQuery('#infinito').prop('checked');
			jQuery('#infinito').prop('checked', false);

			media_uploader = wp.media({
				frame: "post",
				state: "insert",
				multiple: false
			});

			// Allow to save images by URL
			media_uploader.state('embed').on('select', function () {
				var state = media_uploader.state(),
					type = state.get('type'),
					embed = state.props.toJSON();

				embed.url = embed.url || '';

				console.log(embed);
				console.log(type);
				console.log(state);

				if (type === 'image' && embed.url) {
					// Guardar img					
					wpsePrepareGalleryFilesForCellFormat([{
						url: embed.url,
						id: embed.url
					}], cellCoords);
				}



			});
			media_uploader.on('open', function () {
				var selection = media_uploader.state().get('selection');
				var selected = file; // the id of the image
				if (selected) {
					selection.add(wp.media.attachment(selected));
				}
			});
			media_uploader.on('close', function () {
				jQuery('html,body').scrollLeft(scrollLeft);
				jQuery(window).scrollTop(scrollTop);
				jQuery('#infinito').prop('checked', currentInfiniteScrollStatus);
			});
			media_uploader.on("insert", function () {
				jQuery('html,body').scrollLeft(scrollLeft);

				var length = media_uploader.state().get("selection").length;
				var images = media_uploader.state().get("selection").models

				console.log(images);
				if (!images.length) {
					return true;
				}
				for (var iii = 0; iii < length; iii++) {
					gallery.push({
						url: images[iii].attributes.url,
						id: images[iii].id
					});
				}

				button.data('file', images[0].id);

				wpsePrepareGalleryFilesForCellFormat(gallery, cellCoords);
			});
			media_uploader.open();
			loading_ajax(false);
			return false;
		});
	}

	/**
	 * Save image cells, multiple images
	 */
	if (typeof wp !== 'undefined' && wp.media) {
		jQuery('body').on('click', '.set_custom_images.multiple', function (e) {
			e.preventDefault();

			loading_ajax(true);
			var button = jQuery(this);
			var $cell = button.parent('td');
			var cellCoords = hot.getCoords($cell[0]);
			console.log(hot.getDataAtCell(cellCoords.row, cellCoords.col));
			var scrollLeft = jQuery('html,body').scrollLeft();
			var id = button.data('id');
			var key = button.data('key');
			var type = button.data('type');
			var gallery = [];

			var scrollTop = jQuery(document).scrollTop();
			var currentInfiniteScrollStatus = jQuery('#infinito').prop('checked');
			jQuery('#infinito').prop('checked', false);

			media_uploader = wp.media({
				frame: "post",
				state: "insert",
				multiple: true
			});

			// Allow to save images by url
			media_uploader.state('embed').on('select', function () {
				var state = media_uploader.state(),
					type = state.get('type'),
					embed = state.props.toJSON();

				embed.url = embed.url || '';

				console.log(embed);
				console.log(type);
				console.log(state);

				if (type === 'image' && embed.url) {
					// Guardar img					

					wpsePrepareGalleryFilesForCellFormat([{
						url: embed.url,
						id: embed.url
					}], cellCoords);
				}



			});

			media_uploader.on('close', function () {
				jQuery('html,body').scrollLeft(scrollLeft);
				jQuery(window).scrollTop(scrollTop);
				jQuery('#infinito').prop('checked', currentInfiniteScrollStatus);
			});
			media_uploader.on("insert", function () {
				jQuery('html,body').scrollLeft(scrollLeft);

				var length = media_uploader.state().get("selection").length;
				var images = media_uploader.state().get("selection").models
				console.log(images);
				for (var iii = 0; iii < length; iii++) {
					gallery.push({
						url: images[iii].attributes.url,
						id: images[iii].id
					});
				}

				wpsePrepareGalleryFilesForCellFormat(gallery, cellCoords);
			});
			media_uploader.open();
			loading_ajax(false);
			return false;
		});
	}

	/**
	 * Preview image on image cells, single image
	 */
	jQuery('body').on('click', '.view_custom_images', function () {
		var button = jQuery(this);
		var $cell = button.parent('td');
		var cellCoords = hot.getCoords($cell[0]);
		var images = hot.getDataAtCell(cellCoords.row, cellCoords.col);

		var html = '';
		images.split(',').forEach(function (image) {
			html += '<div><img src="' + image.trim() + '"/></div>';
		});
		jQuery('div[data-remodal-id=image] .modal-content').html(html);
		jQuery('[data-remodal-id=image]').remodal();
	});

	/**
	 * Move to next post on tinymce cells modal
	 */
	jQuery('button.siguiente').on('click', function () {
		var element = jQuery(this);
		// Using if because this function is used by all the popups with navigation, not just the tinymce popup
		if (element.parents('.modal-tinymce-editor').length) {
			saveTinymcePopup();
		}
		var pos = element.data('pos');
		var key = element.parents('.remodal').data('column-key');

		var $cell = jQuery(hot.getCell(pos, hot.propToCol(key)));
		// Allow to delay the navigation in case the popup needs time to initialize/animate
		if (element.data('delay')) {
			setTimeout(function () {
				$cell.find('.button').click();
			}, parseInt(element.data('delay')));
		} else {
			$cell.find('.button').trigger('click');
		}
	});

	/**
	 * Move to previous post on tinymce cells modal
	 */
	jQuery('button.anterior').on('click', function () {
		var element = jQuery(this);
		// Using if because this function is used by all the popups with navigation, not just the tinymce popup
		if (element.parents('.modal-tinymce-editor').length) {
			saveTinymcePopup();
		}
		var pos = element.data('pos');
		var key = element.parents('.remodal').data('column-key');

		var $cell = jQuery(hot.getCell(pos, hot.propToCol(key)));
		// Allow to delay the navigation in case the popup needs time to initialize/animate
		if (element.data('delay')) {
			setTimeout(function () {
				$cell.find('.button').trigger('click');
			}, parseInt(element.data('delay')));
		} else {
			$cell.find('.button').trigger('click');
		}
	});


	/**
	 * Open tinymce cell modal
	 */
	jQuery('body').on('click', '.btn-popup-content', function () {
		var element = jQuery(this);
		var post_id = element.data('id');
		var key = element.data('key');
		var type = element.data('type');
		var length = hot.countRows();

		var $button = jQuery(this);
		var $cell = $button.parent('td');
		var cellCoords = hot.getCoords($cell[0]);
		var postTitle = vgseGetRowTitle(cellCoords.row);
		var pos = cellCoords.row;

		var $modal = jQuery('.modal-tinymce-editor');
		// Display or hide the unnecesary navigation buttons.
		// If first post, hide "previous" button.
		// If last post, hide "next" button
		if (pos === 0) {
			$modal.find('button.anterior').hide();
			$modal.find('button.anterior').next('[data-wpse-tooltip]').hide();
		} else {
			$modal.find('button.anterior').show();
			$modal.find('button.anterior').next('[data-wpse-tooltip]').show();
		}
		if (pos === (length - 1)) {
			$modal.find('button.siguiente').hide();
			$modal.find('button.siguiente').next('[data-wpse-tooltip]').hide();
		} else {
			$modal.find('button.siguiente').show();
			$modal.find('button.siguiente').next('[data-wpse-tooltip]').show();
		}

		$modal.find('button.anterior').data('pos', pos - 1);
		$modal.find('button.siguiente').data('pos', pos + 1);


		if (postTitle) {
			jQuery('.modal-tinymce-editor .post-title-modal span').text(postTitle).show();
		} else {
			jQuery('.modal-tinymce-editor .post-title-modal').hide();
		}

		jQuery('.modal-tinymce-editor .remodal-confirm').data('post_id', post_id);
		jQuery('.modal-tinymce-editor').data('column-key', key);
		jQuery('.modal-tinymce-editor .remodal-confirm').data('type', type);
		jQuery('.modal-tinymce-editor .remodal-confirm').data('cellCoords', cellCoords);

		jQuery('[data-remodal-id="editor"]').remodal().open();
	});

	jQuery(document).on('opened', '[data-remodal-id="editor"]', function (e) {
		var $modal = jQuery(this);
		var cellCoords = $modal.find('.remodal-confirm').data('cellCoords');
		var postContent = hot.getDataAtCell(cellCoords.row, cellCoords.col);

		if (!window.tinymceEditorInitialized) {
			window.tinymceEditorInitialized = true;
			jQuery('html').addClass('wpse-loading-tinymce');
			// The first time, we must wait for the editor to initialize to insert the content
			tinyMCEPreInit.mceInit.editpost.setup = function (editor) {
				editor.on('init', function (e) {
					setTinymceContent(postContent);
				});
			}
			wp.editor.initialize(
				'editpost',
				{
					tinymce: tinyMCEPreInit.mceInit.editpost,
					quicktags: tinyMCEPreInit.qtInit.editpost,
					mediaButtons: true
				}
			);
		} else {
			// We can insert the content right away because the editor already initialized
			setTinymceContent(postContent);
		}
	});

	function setTinymceContent(postContent) {
		switchEditors.go('editpost', 'html');
		vgseTinymce_setContent(postContent, 'editpost', 'editpost');
		switchEditors.go('editpost', 'tmce');
		jQuery('html').removeClass('wpse-loading-tinymce');
	}

	function saveTinymcePopup() {
		var element = jQuery('.modal-tinymce-editor .remodal-confirm');
		var cellCoords = element.data('cellCoords');

		// Get tinymce editor content
		var content = beGetTinymceContent();
		hot.setDataAtCell(cellCoords.row, cellCoords.col, content);
	}
	/**
	 * Save changes on tinymce editor
	 */
	jQuery('.guardar-popup-tinymce').on('click', function (e) {
		saveTinymcePopup();
	});

	/**
	 * Notify that this tool is disabled because they haven't save changes
	 */
	jQuery('body').on('click', '.wpse-disable-if-unsaved-changes.disabled', function (e) {
		alert(vgse_editor_settings.texts.save_changes_before_using_tool);
	});

	/**
	 * Load more posts in the spreadsheet
	 */
	jQuery('.pagination-jump input').on('keyup', function (event) {
		var pageNumber = parseInt(jQuery(this).val());
		var maxNumber = parseInt(jQuery(this).attr('max'));
		if (event.keyCode == 13 && pageNumber !== window.beCurrentPage && pageNumber >= 1 && pageNumber <= maxNumber) {
			vgseReloadSpreadsheet(true, null, pageNumber);
			jQuery(this).blur();
			return true;
		}
	});
	jQuery('body').on('click', '.load-more', function () {
		if (jQuery('#formato').is(':checked')) {
			format = true;
		} else {
			format = false;
		}
		var nonce = jQuery('.remodal-bg').data('nonce');

		// If pagination is activated, we reload the spreadsheet starting from a specific page
		if (jQuery(this).data('pagination')) {
			var newPageNumber = parseInt(jQuery(this).data('pagination'));
			if (newPageNumber && newPageNumber !== window.beCurrentPage) {
				vgseReloadSpreadsheet(true, null, newPageNumber);
			}
			return true;
		}

		var paged = window.beCurrentPage + 1;

		beLoadPosts({
			post_type: $container.data('post-type'),
			paged: paged,
			nonce: nonce
		}, function (response) {

			if (response.success) {
				vgseAddFoundRowsCount(response.data.total);
				vgAddRowsToSheet(response.data.rows);

				loading_ajax(false);
				var successMessage = response.data.message || vgse_editor_settings.texts.posts_loaded;
				notification({ mensaje: successMessage });
				//Para detener el scroll mientras se ejecuta otro y volver a activarlo
				window.scrroll = true;

				if (!response.data || !response.data.rows.length) {
					window.scrroll = false;
				}
			} else {

				loading_ajax(false);
				notification({ mensaje: response.data.message, tipo: 'info', time: 30000 });
				window.scrroll = false;
			}
		});
	});

	// Update the table height as soon as the footer buttons become visible.
	// This fixes the issue where the footer buttons might appear on top of the final cells 
	// or too much white space appeared at the bottom
	if (document.querySelector(".load-more")) {
		var sectionObserver = new IntersectionObserver(callBackFunction, {
			root: null,
			threshold: 0,
			rootMargin: "0px",
		});
		sectionObserver.observe(document.querySelector(".load-more"));
		function callBackFunction(entries) {
			console.log(entries);
			if (entries[0].isIntersecting) {
				var tableHeight = jQuery('.ht_master').height() - 250;
				jQuery('#post-data').css('min-height', tableHeight);
			}
		}
	}

	/**
	 * Init infinite scroll
	 */
	var contenedor = jQuery('#post-data');
	var cont_offset = contenedor.offset();
	window.scrroll = true;
	window.isAddColumnNotified = false;
	var countRows = hot.countRows();
	var sheetWidth = jQuery('.ht_clone_top').width();
	var sheetWideEnough = sheetWidth > jQuery(window).width();
	var documentBiggerThanScreen = (jQuery(document).width() + 200) > jQuery(window).width();
	var $infiniteScroll = jQuery('#infinito');
	jQuery(window).on('scroll', _throttle(function () {
		var isScrollDown = scrollDown('infiniteLoad');
		// Infinite scroll check
		if ($infiniteScroll.length && $infiniteScroll.is(':checked') && jQuery(document).height() > jQuery(window).height() && typeof window.beOriginalData !== 'undefined') {
			if ((parseInt(jQuery(window).scrollTop() + jQuery(window).height()) == jQuery(document).height()) && window.scrroll === true && isScrollDown) {
				jQuery('.load-more').trigger('click');
				window.scrroll = false;
			}
		}
		// Scrolled to the right, show missing column hint
		var almostFinishedHorizontalScroll = (jQuery(window).scrollLeft() + jQuery(window).width()) >= (jQuery(document).width() - 400);
		if (sheetWideEnough && vgse_editor_settings.texts.hint_missing_column_on_scroll && documentBiggerThanScreen && almostFinishedHorizontalScroll && !window.isAddColumnNotified && !isScrollDown) {
			window.isAddColumnNotified = true;

			notification({
				mensaje: vgse_editor_settings.texts.hint_missing_column_on_scroll,
				tipo: 'info',
				time: 80000,
				position: 'bottom'
			});
		}
	}, 500, {
		leading: true,
		trailing: true
	}));

	jQuery('body').on('click', '.show-column-missing-tips', function (e) {
		e.preventDefault();
		setTimeout(function () {
			jQuery('.modal-columns-visibility').parent().scrollTop(jQuery('.missing-column-tips').offset().top);
		}, 250);
	});

	/**
	 * Change cell formatting setting
	 * @param boolean active
	 * @returns boolean
	 */
	function columns_format(active) {
		if (active === true) {
			var defaultColumns = vgse_editor_settings.columnsFormat
		} else {
			var defaultColumns = vgse_editor_settings.columnsUnformat
		}

		var out = vgObjectToArray(defaultColumns);

		out.forEach(function (columnSettings, index) {
			if (typeof columnSettings.source === 'string') {
				if (columnSettings.source === 'loadTaxonomyTerms') {
					out[index].source = _throttle(function (query, process) {
						return loadTaxonomyTerms(query, process);
					}, 1500, {
						leading: true,
						trailing: true
					});
				}
				if (columnSettings.source === 'searchPostByKeyword') {
					out[index].source = _throttle(function (query, process) {
						return searchPostByKeyword(query, process, columnSettings.searchPostType);
					}, 1500, {
						leading: true,
						trailing: true
					});
				}
				if (columnSettings.source === 'searchUsers') {
					out[index].source = _throttle(function (query, process) {
						return searchUsers(query, process);
					}, 1500, {
						leading: true,
						trailing: true
					});
				}
			}
		});
		return out;
	}

	function searchUsers(query, process) {
		var nonce = jQuery('.remodal-bg').data('nonce');
		var post_type = vgse_editor_settings.post_type;

		jQuery.ajax({
			url: vgse_global_data.ajax_url,
			dataType: 'json',
			data: {
				action: "vgse_find_users_by_keyword",
				search: query,
				nonce: nonce,
				post_type: post_type,
				wpse_source: 'users_dropdown_column'
			},
			success: function (response) {
				console.log("response", response);
				var users = [];
				if (response.success) {
					users = response.data.data;
				}

				process(users);
			}
		});

	}
	function searchPostByKeyword(query, process, searchPostType) {
		if (!query) {
			return process([]);
		}
		var nonce = jQuery('.remodal-bg').data('nonce');
		var post_type = searchPostType || jQuery('#post_type_new_row').val();

		jQuery.ajax({
			url: vgse_global_data.ajax_url,
			dataType: 'json',
			data: {
				action: "vgse_find_post_by_name",
				search: query,
				nonce: nonce,
				post_type: post_type,
				wpse_source: 'post_dropdown_column'
			},
			success: function (response) {
				console.log("response", response);
				var titles = [];
				if (response.success) {
					response.data.data.forEach(function (post) {
						titles.push(post.title);
					});
				}

				process(titles);
			}
		});

	}
	function loadTaxonomyTerms(query, process) {
		var nonce = jQuery('.remodal-bg').data('nonce');
		var post_type = jQuery('#post_type_new_row').val();
		var columnKey = hot.colToProp(hot.getSelected()[0][1]);
		var taxonomyKey = vgse_editor_settings.columnsFormat[columnKey].taxonomy_key || columnKey;

		if (typeof window.wpseTaxonomyTerms === 'undefined') {
			window.wpseTaxonomyTerms = {};
		}
		if (typeof window.wpseTaxonomyTerms[taxonomyKey] === 'undefined') {
			window.wpseTaxonomyTerms[taxonomyKey] = [];
			jQuery.ajax({
				url: vgse_global_data.ajax_url,
				dataType: 'json',
				data: {
					action: "vgse_get_taxonomy_terms",
					taxonomy_key: taxonomyKey,
					nonce: nonce,
					post_type: post_type,
					wpse_source: 'taxonomy_column'
				},
				success: function (response) {
					console.log("response", response);
					window.wpseTaxonomyTerms[taxonomyKey] = response.data;
					//process(JSON.parse(response.data)); // JSON.parse takes string as a argument
					process(response.data);

				}
			});
		} else {
			process(window.wpseTaxonomyTerms[taxonomyKey]);
		}

	}

	jQuery('body').on('click', '.wpse-enable-locked-cell', function (e) {
		e.preventDefault();

		var columnKey = hot.colToProp(hot.getSelected()[0][1]);
		vgse_editor_settings.lockedColumnsManuallyEnabled.push(columnKey);
		var column = hot.propToCol(columnKey);
		// We reset the cell data to force handsontable to re-render the column
		var currentData = hot.getDataAtCell(1, column);
		hot.setDataAtCell(1, column, currentData);
	});

	/**
	 * Update cells formatting = change to plain text and viceversa
	 */
	jQuery('#formato').on('change', function () {
		if (jQuery(this).is(':checked')) {
			format = false;
		} else {
			format = true;
		}
		//console.log(format);

		var defaultColumns = columns_format(format);

		if (window.vgseColumnsVisibilityUsed) {
			Alpine.$data(document.querySelector('[x-data="vgseColumnsManager"]')).columnsVisibilityUpdateHOT(defaultColumns, vgse_editor_settings.colHeaders, vgse_editor_settings.colWidth, 'softUpdate');
		} else {
			hot.updateSettings({
				columns: defaultColumns
			});
		}
	});

	/**
	 * Add new rows to spreadsheet
	 */
	jQuery("#addrow").on('click', function () {
		var nonce = jQuery('.remodal-bg').data('nonce');
		var post_type = jQuery('#post_type_new_row').val();
		var rows = (jQuery(this).next('.number_rows').length && jQuery(this).next('.number_rows').val()) ? parseInt(jQuery(this).next('.number_rows').val()) : 1;
		var extra_data = typeof window.wpseAddRowExtraData !== 'undefined' ? window.wpseAddRowExtraData : null;
		loading_ajax(true);

		// Create posts as drafts
		jQuery.ajax({
			type: "POST",
			url: vgse_global_data.ajax_url,
			data: { action: "vgse_insert_individual_post", nonce: nonce, post_type: post_type, rows: rows, extra_data: extra_data },
			dataType: 'json',
			success: function (res) {

				console.log(res);
				if (res.success) {
					// Add rows to spreadsheet							
					vgseAddFoundRowsCount(window.beFoundRows + parseInt(rows));
					vgAddRowsToSheet(res.data.message, 'prepend');

					loading_ajax(false);
					notification({ mensaje: vgse_editor_settings.texts.new_rows_added });

					// Scroll up to the new rows
					var cellsPosition = jQuery('.be-spreadsheet-wrapper').offset().top - jQuery('#vg-header-toolbar').height() - 20;
					if (!vgseIsInViewport(jQuery('.be-spreadsheet-wrapper'))) {
						jQuery(window).scrollTop(cellsPosition);
					}
				} else {
					loading_ajax(false);
					notification({ mensaje: res.data.message, tipo: 'error', tiempo: 60000 });
				}

				jQuery('body').trigger('vgSheetEditor:afterNewRowsInsert', [res, post_type, rows]);
			}
		});
	});

	jQuery('#addrow2').on('click', function () {
		jQuery('#addrow').trigger('click');
	});



	/**
	 * Fix toolbar on scroll
	 */
	function sticky_relocate(direction, $mainToolbar, $toolbarPlaceholder, scrollDownId, div_top, toolbarHeight, toolbarLeft) {
		var scrollTop = jQuery(window).scrollTop();
		var isVerticalScroll = scrollDown(scrollDownId + direction);
		var scrollLeft = jQuery(window).scrollLeft();

		if (isVerticalScroll && direction === 'top') {
			if (scrollTop > div_top) {
				$mainToolbar.removeClass('sticky-left');
				$mainToolbar.css({
					'left': '',
					'width': '',
				});
				$mainToolbar.removeClass('sticky-left');
				$mainToolbar.css('top', '');
				$mainToolbar.addClass('sticky');
				jQuery('#wpadminbar').hide();
				$toolbarPlaceholder.height(toolbarHeight);

			} else {
				jQuery('#wpadminbar').show();
				$mainToolbar.removeClass('sticky');
				$toolbarPlaceholder.height(0);
			}
		}

		if (!isVerticalScroll && direction !== 'top') {
			if (scrollTop === 0) {
				jQuery('#wpadminbar').show();
				$mainToolbar.removeClass('sticky');
				$toolbarPlaceholder.height(0);
			}
			if ($mainToolbar.hasClass('sticky')) {
				$mainToolbar.css({
					'left': '',
					'width': '',
				});
				$mainToolbar.removeClass('sticky-left');
			} else if (scrollLeft > (toolbarLeft + 20)) {
				$toolbarPlaceholder.height(toolbarHeight);
				$mainToolbar.addClass('sticky-left');
				$mainToolbar.css({
					'left': scrollLeft - jQuery('#vgse-wrapper').offset().left,
					'width': jQuery(window).width(),
				});
			} else {
				$toolbarPlaceholder.height(0);
				$mainToolbar.css({
					'left': '',
					'width': '',
				});
				$mainToolbar.removeClass('sticky-left');
			}
		}
	}

	if (jQuery('#vg-header-toolbar').length && window.location.href.indexOf('wpse_no_sticky_toolbar') < 0) {
		var toolbarHeight = jQuery('#vg-header-toolbar').outerHeight();
		var toolbarLeft = jQuery('#vg-header-toolbar').offset().left;
		var div_top = jQuery('#vg-header-toolbar-placeholder').offset().top;
		var $mainToolbar = jQuery('#vg-header-toolbar.js-sticky-top');
		var $toolbarPlaceholder = jQuery('#vg-header-toolbar-placeholder');

		if ($mainToolbar.hasClass('js-sticky-top')) {
			jQuery(window).on('scroll', _throttle(function () {
				sticky_relocate('top', $mainToolbar, $toolbarPlaceholder, 'menu', div_top, toolbarHeight, toolbarLeft);
			}, 20));
			sticky_relocate('top', $mainToolbar, $toolbarPlaceholder, 'menu', div_top, toolbarHeight, toolbarLeft);
		}

		if ($mainToolbar.hasClass('js-sticky-left')) {
			jQuery(window).on('scroll', _throttle(function () {
				sticky_relocate('left', $mainToolbar, $toolbarPlaceholder, 'menu', div_top, toolbarHeight, toolbarLeft);
			}, 5));
			sticky_relocate('left', $mainToolbar, $toolbarPlaceholder, 'menu', div_top, toolbarHeight, toolbarLeft);
		}
	}
	// Fix the footer when scrolling to the right so the pagination options are visible at the bottom always
	var $footerToolbar = jQuery('#vg-footer-toolbar.js-sticky');
	if ($footerToolbar.length) {
		var footerToolbarHeight = $footerToolbar.outerHeight();
		var footerToolbarLeft = $footerToolbar.offset().left;
		var footerDiv_top = $footerToolbar.offset().top;
		var $footerMainToolbar = $footerToolbar;
		var $footerToolbarPlaceholder = jQuery('#vg-footer-toolbar-placeholder');
		jQuery(window).on('scroll', _throttle(function () {
			sticky_relocate('left', $footerMainToolbar, $footerToolbarPlaceholder, 'footer', footerDiv_top, footerToolbarHeight, footerToolbarLeft);
		}, 5));
		sticky_relocate('left', $footerMainToolbar, $footerToolbarPlaceholder, 'footer', footerDiv_top, footerToolbarHeight, footerToolbarLeft);
	}

	jQuery('body').trigger('vgSheetEditor:afterInit');

	// Move the last 3 elements from the main toolbar into the secondary toolbar, if the screen is narrow
	if (jQuery(window).width() < 1200 && jQuery('#vg-header-toolbar > .vg-header-toolbar-inner').height() > 50) {
		jQuery('.vg-secondary-toolbar .vg-header-toolbar-inner div.clear').before(jQuery('#vg-header-toolbar > .vg-header-toolbar-inner > .button-container:gt(-3)'));
	}


});


/**
 * Verify we´re scrolling vertically, not horizontally
 */
var lastScrollTop = {};
function scrollDown(flag) {
	if (!lastScrollTop[flag]) {
		lastScrollTop[flag] = 0;
	}

	var st = jQuery(window).scrollTop();
	if (st !== lastScrollTop[flag]) {
		down = true;
	} else {
		down = false;
	}
	lastScrollTop[flag] = st;
	return down;
}


/**
 * Display warning before closing the page to ask the user to save changes
 */
var vgseClosePageWithoutWarning = false;
var vgseAllowToClosePageWithoutWarning = function (allow) {
	vgseClosePageWithoutWarning = allow;
	// Disable the auto save flag when we finish saving, but don't auto enable 
	// the flag because it will break the auto save
	if (allow) {
		window.wpseAutoSavingInProgress = !allow;
	}
};

jQuery(window).on("beforeunload", function () {
	if (jQuery('.be-spreadsheet-wrapper').length) {
		var modifiedData = beGetModifiedItems(hot.getSourceData(), window.beOriginalData);
	} else {
		var modifiedData = [];
	}

	if (!jQuery('.be-spreadsheet-wrapper').length || !modifiedData.length || vgseClosePageWithoutWarning) {
		return undefined;
	}
	return vgse_editor_settings.texts.save_changes_on_leave;
});


jQuery(document).ready(function () {
	var $quickSetupContent = jQuery('.quick-setup-page-content');

	if (!$quickSetupContent.length) {
		return true;
	}

	function nextStep() {
		jQuery('.setup-step.active').removeClass('active').next().addClass('active');
		jQuery(' #vgse-wrapper .progressbar li.active').removeClass('active').next().addClass('active');
	}
	function prevStep() {
		jQuery('.setup-step.active').removeClass('active').prev().addClass('active');
		jQuery(' #vgse-wrapper .progressbar li.active').removeClass('active').prev().addClass('active');
	}

	$quickSetupContent.find('.step-back').on('click', function (e) {
		e.preventDefault();
		prevStep();
	});
	$quickSetupContent.find('.save-all-trigger').on('click', function (e) {
		e.preventDefault();
		var $allTrigger = jQuery(this);
		var $step = $allTrigger.parents('.setup-step');
		var $forms = $step.find('form');
		loading_ajax(true);

		if (!$forms.length) {
			nextStep();
			loading_ajax(false);
			return true;
		}

		$step.find('.save-trigger').each(function () {
			jQuery(this).trigger('click');
		});

		var savedCount = 0;
		var savedNeeded = $step.find('.save-trigger').length;

		var intervalId = setInterval(function () {
			var $saved = $step.find('.save-trigger').filter(function () {
				return jQuery(this).data("saved") === 'yes';
			});
			// finished saving all forms.
			if ($saved.length === savedNeeded) {
				clearInterval(intervalId);
				nextStep();
				loading_ajax(false);
			}
		}, 800);
	});

	$quickSetupContent.find('.save-trigger').on('click', function (e) {
		e.preventDefault();
		var $button = jQuery(this);

		var $form = $button.parents('form');
		var callback = $form.data('callback');
		jQuery.post($form.attr('action'), $form.serializeArray(), function (response) {
			$button.data('saved', 'yes');

			if (callback) {
				vgseExecuteFunctionByName(callback, window, {
					response: response,
					form: $form
				});
			}
		});

	});
});


jQuery(document).ready(function () {

	// Submit formulas modal form 
	jQuery('body').on('click', '.form-submit-outside', function (e) {
		e.preventDefault();

		jQuery(this).parents('.remodal').find('form .form-submit-inside').trigger('click');
	});




	// Disable infinite scroll when opening modals
	jQuery(document).on('opened', '.remodal', function (e) {
		console.log('Modal is opened');
		// Save the existing scroll position, and disable infinite scroll to
		// avoid loosing the scroll position and loading more posts while it´s opened.
		var scrollTop = jQuery(document).scrollTop();
		var currentInfiniteScrollStatus = jQuery('#infinito').prop('checked');
		jQuery('#infinito').prop('checked', false);
		jQuery('body').data('temp-status', currentInfiniteScrollStatus).data('temp-scrolltop', scrollTop);


		var scrollLeft = jQuery('html,body').scrollLeft();
		jQuery('body').data('temp-scrollleft', scrollLeft);

		// Deselect cells when we open the popups, so it doesn't edit cells in the background when we type in the popups
		hot.deselectCell();
	});
	jQuery(document).on('closed', '.remodal', function () {
		console.log('Modal is closed');
		var scrollTop = jQuery('body').data('temp-scrolltop');
		var scrollLeft = jQuery('body').data('temp-scrollleft');
		var scrollInfinito = jQuery('body').data('temp-status');

		if (scrollTop) {
			jQuery(window).scrollTop(scrollTop);
		}
		if (scrollLeft) {
			jQuery('html,body').scrollLeft(scrollLeft);
		}
		if (scrollInfinito) {
			jQuery('#infinito').prop('checked', scrollInfinito);
		}
	});

	// Close the current modal before opening another modal
	jQuery('body').on('click', '[data-wpse-remodal-target]', function () {
		vgseGoToModal(jQuery(this).data('wpse-remodal-target'));
	});
});


// handsontable cells

// Initialize spreadsheet
function initHandsontableForPopup(data, modalSettings) {

	if (modalSettings.type === 'handsontable') {
		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		if (!data) {
			data = [];
		}

		var columnWidths = modalSettings.handsontable_column_widths[modalSettings.post_type];
		var columnHeaders = modalSettings.handsontable_column_names[modalSettings.post_type];
		var columns = modalSettings.handsontable_columns[modalSettings.post_type];
		var container3 = document.getElementById('handsontable-in-modal');


		if (window.hotAttr && !window.hotAttr.isDestroyed) {
			window.hotAttr.destroy();
		}

		var responseData;
		if (data.custom_handsontable_args) {
			responseData = data.data;
		} else {
			responseData = data;
		}

		if (!responseData.length && window.wpseCurrentPopupSourceCoords.cellValue) {
			responseData = window.wpseCurrentPopupSourceCoords.cellValue;
		}

		var cellHandsontableArgs = {
			data: responseData,
			minSpareRows: 1,
			wordWrap: true,
			colWidths: columnWidths,
			allowInsertRow: true,
			columnSorting: true,
			colHeaders: columnHeaders,
			columns: columns,
			afterColumnSort: function (currentSortConfig, destinationSortConfigs) {
				if (modalSettings.key === '_vgse_create_attribute') {
					var sourceData = window.hotAttr.getSourceData();
					var sortedNames = window.hotAttr.getDataAtProp('name');
					var sourceDataWithKeys = [];
					sourceData.forEach(function (row) {
						sourceDataWithKeys[row.name] = row;
					});
					sortedNames.forEach(function (sortedName, index) {
						sourceDataWithKeys[sortedName].position = index;
					});
				}
			}
		};

		var finalCellHandsontableArgs = jQuery.extend(cellHandsontableArgs, data.custom_handsontable_args);
		window.hotAttr = new Handsontable(container3, finalCellHandsontableArgs);

	} else if (modalSettings.type === 'metabox') {
		initEditorIframe(modalSettings);

	}
	loading_ajax(false);
}

function initEditorIframe(modalSettings) {
	// Bail if iframes were already initiated
	//	if (typeof window.vgcaIsFrontendSession !== 'undefined' && window.vgcaIsFrontendSession) {
	//		return true;
	//	}

	window.$iframeWrappers = jQuery('.vgca-iframe-wrapper');
	var $iframeWrapper = window.$iframeWrappers;
	$iframeWrapper.show();
	$iframeWrapper.find('iframe').remove();
	var iframeHtml = $iframeWrapper.find('.iframe-template').prop('outerHTML').replace(/div/g, 'iframe');
	var $iframe = jQuery(iframeHtml);
	$iframe.removeClass('iframe-template');
	$iframe.attr('src', $iframe.data('src') + modalSettings.post_id + '&wpse_column=' + modalSettings.key);
	$iframeWrapper.append($iframe);

	jQuery('.custom-modal-editor').addClass('modal-editor-' + modalSettings.key);

	window.vgcaIsFrontendSession = [];
	$iframeWrappers.each(function () {
		var $iframeWrapper = jQuery(this);
		var $iframe = $iframeWrapper.find('iframe');
		var hash = window.location.hash;

		$iframe.data('lastPage', $iframe.contents().get(0).location.href);

		window.vgcaIsFrontendSession.push(setInterval(function () {
			var currentPage = $iframe.contents().get(0).location.href;

			// If the user navigated to another admin page, update the iframe height
			if (currentPage !== $iframe.data('lastPage')) {
				$iframeWrappers.css('height', '');
				$iframe.css('height', '');
				$iframe.data('lastPage', currentPage);
			}

			// Prevent js errors when the admin page hasn't loaded yet
			var $iframeContents = null;
			try {
				var $iframeContents = $iframe.contents();
			} catch (e) {

			}
			if ($iframeContents) {
				// var iframeHeight = $iframeContents.height();
				var iframeHeight = 700;
				$iframe.height(iframeHeight);
				$iframeWrapper.height(iframeHeight);

				// Hide all elements except the metabox section that we'll use
				var $field = $iframeContents.find(modalSettings.metabox_show_selector);
				// Make sure the element is visible
				$field.removeClass('acf-hidden').removeClass('hidden').attr('hidden', '').attr('style', 'display: block !important; visibility: 1 !important; opacity: 1 !important;');
				$field.siblings().filter(function () {
					return !(jQuery(this).hasClass('mce-container') || jQuery(this).hasClass('ui-autocomplete') || (jQuery(this).attr('id') && jQuery(this).attr('id').indexOf('__wp-uploader-id') > -1));
				}).attr('style', 'display: none !important');
				$field.parents().each(function () {
					jQuery(this).siblings().filter(function () {
						return !(jQuery(this).hasClass('mce-container') || jQuery(this).hasClass('ui-autocomplete') || (jQuery(this).attr('id') && jQuery(this).attr('id').indexOf('__wp-uploader-id') > -1) || jQuery(this).hasClass('components-popover__fallback-container'));
					}).attr('style', 'display: none !important');
				});
			}
		}, 1000));
	});
}

jQuery(document).ready(function () {

	// Open modal
	jQuery('body').on('click', '.button-custom-modal-editor', function (e) {
		e.preventDefault();
		var $button = jQuery(this);
		var buttonData = $button.data();

		var $cell = $button.parent('td');
		if ($cell.length) {
			var cellCoords = hot.getCoords($cell[0]);
			window.wpseCurrentPopupSourceCoords = cellCoords;
			if (buttonData.modalSettings.use_new_handsontable_renderer) {
				var cellData = hot.getDataAtCell(window.wpseCurrentPopupSourceCoords.row, window.wpseCurrentPopupSourceCoords.col);
				window.wpseCurrentPopupSourceCoords.cellValue = cellData ? JSON.parse(cellData) : {};
			}
		}

		if (!window.hotModalCache) {
			window.hotModalCache = {};
		}
		if (!window.hotModalCache[buttonData.modalSettings.post_id]) {
			window.hotModalCache[buttonData.modalSettings.post_id] = {};
		}

		var $modal = jQuery('.custom-modal-editor');

		// Display or hide the unnecesary navigation buttons.
		// If first post, hide "previous" button.
		// If last post, hide "next" button
		if ($cell.length) {
			var length = hot.countRows();
			var pos = cellCoords.row;
			if (pos === 0) {
				$modal.find('button.anterior').hide();
			} else {
				$modal.find('button.anterior').show();
			}
			if (pos === (length - 1)) {
				$modal.find('button.siguiente').hide();
			} else {
				$modal.find('button.siguiente').show();
			}

			$modal.find('button.anterior').data('pos', pos - 1);
			$modal.find('button.siguiente').data('pos', pos + 1);
		}

		if (buttonData.modalSettings.type === 'metabox') {
			var existing = null;
		} else {
			var existing;
			if (window.hotModalCache && window.hotModalCache[buttonData.modalSettings.post_id][buttonData.modalSettings.edit_modal_save_action]) {
				existing = window.hotModalCache[buttonData.modalSettings.post_id][buttonData.modalSettings.edit_modal_save_action];
			} else {
				existing = buttonData.existing;
			}
			if (typeof existing === 'string') {
				if (!existing) {
					existing = '{}';
				}
				existing = JSON.parse(existing);
			}
		}
		var currentRowData = {
			'button': $button,
			'modalSettings': buttonData.modalSettings,
			'existing': existing,
		};

		window.vgseWCAttsCurrent = currentRowData;
		setTimeout(function () {
			var modalInstance = $modal.remodal().open();
		}, 500);
		$modal.addClass('modal-editor-' + buttonData.modalSettings.key);
	});

	// Cancel edit
	jQuery('body').on('click', '.custom-modal-editor .remodal-cancel', function (e) {
		var $button = jQuery(this);
		var $modal = $button.parents('.custom-modal-editor');
		var data = window.vgseWCAttsCurrent;

		if (data.modalSettings.edit_modal_cancel_action) {
			loading_ajax(true);

			var functionNames = data.modalSettings.edit_modal_cancel_action.replace('js_function_name:', '').split(',');
			functionNames.forEach(function (functionName) {
				vgseExecuteFunctionByName(functionName, $modal.find('iframe')[0].contentWindow);
			});
			loading_ajax(false);
		}
	});

	// Save changes
	jQuery('body').on('click', '.custom-modal-editor .save-changes-handsontable', function (e) {
		var $button = jQuery(this);
		var $modal = $button.parents('.custom-modal-editor');
		var nonce = jQuery('.remodal-bg').data('nonce');
		var data = window.vgseWCAttsCurrent;

		loading_ajax(true);

		if (data.modalSettings.type === 'handsontable') {
			var attrData = hotAttr.getSourceData();
		} else if (data.modalSettings.type === 'metabox') {

			if (data.modalSettings.metabox_value_selector.indexOf('js_function_name:') > -1) {
				var functionName = data.modalSettings.metabox_value_selector.replace('js_function_name:', '');
				var attrData = vgseExecuteFunctionByName(functionName, $modal.find('iframe')[0].contentWindow);
			} else {
				var $metaboxFields = $modal.find('iframe').contents().find(data.modalSettings.metabox_value_selector);
				var attrData = $metaboxFields.length === 1 ? $metaboxFields.val() : beParseParams($metaboxFields.serialize());
			}
		}

		if (!window.hotModalCache) {
			window.hotModalCache = {};
		}
		if (!window.hotModalCache[data.modalSettings.post_id]) {
			window.hotModalCache[data.modalSettings.post_id] = {};
		}

		// cache product data
		if (!data.modalSettings.edit_modal_get_action) {
			data.button.data('existing', attrData);

			window.hotModalCache[data.modalSettings.post_id][data.modalSettings.edit_modal_save_action] = attrData;
		}

		if (data.modalSettings.type === 'handsontable') {

			if (data.modalSettings.use_new_handsontable_renderer) {
				hot.setDataAtCell(window.wpseCurrentPopupSourceCoords.row, window.wpseCurrentPopupSourceCoords.col, JSON.stringify(attrData));
			}
		}

		var saveHandlers = data.modalSettings.edit_modal_save_action.split(',');
		saveHandlers.forEach(function (saveHandler) {
			if (saveHandler.indexOf('js_function_name:') > -1) {
				var functionName = saveHandler.replace('js_function_name:', '');
				vgseExecuteFunctionByName(functionName, $modal.find('iframe')[0].contentWindow);
			} else {
				jQuery.post(vgse_global_data.ajax_url, {
					action: saveHandler,
					nonce: nonce,
					postId: data.modalSettings.post_id,
					postType: data.modalSettings.post_type,
					modalSettings: data.modalSettings,
					data: attrData
				}, function (response) {
					console.log(response);
				});
			}
		});
		jQuery('.custom-modal-editor').remodal().close();
		loading_ajax(false);
	});

	jQuery(document).on('closed', '.custom-modal-editor', function () {
		var data = window.vgseWCAttsCurrent;
		var $modal = jQuery('.custom-modal-editor');


		if (data.modalSettings.type === 'metabox' && typeof window.vgcaIsFrontendSession !== 'undefined' && window.vgcaIsFrontendSession.length) {
			$modal.find('iframe').remove();
			$modal.find('.vgca-iframe-wrapper ').hide();
			window.vgcaIsFrontendSession.forEach(function (intervalId, index) {
				clearInterval(intervalId);
			});
		}

		if (data.modalSettings.type === 'handsontable') {
			if (window.hotAttr && !window.hotAttr.isDestroyed) {
				window.hotAttr.destroy();
			}
		}
		$modal.find('.modal-general-title, .modal-description').hide();

		jQuery('.custom-modal-editor').removeClass('modal-editor-' + data.modalSettings.key);
		loading_ajax(false);

	});
	// Load modal and spreadsheet
	jQuery(document).on('opened', '.custom-modal-editor', function () {
		console.log('Modal is opened');
		var data = window.vgseWCAttsCurrent;


		if (!data) {
			return true;
		}
		loading_ajax(true);
		var $modal = jQuery('.custom-modal-editor');
		$modal.data('column-key', data.modalSettings.key);

		// Display post title in modal
		if (!$modal.find('.modal-post-title').length) {
			$modal.find('.modal-general-title').after('<span class="modal-post-title"></span>');
		}
		$modal.find('.modal-post-title').html(data.modalSettings.post_title);
		if (data.modalSettings.edit_modal_title) {
			$modal.find('.modal-general-title').html(data.modalSettings.edit_modal_title + ': ');
		}
		if (data.modalSettings.edit_modal_description) {
			$modal.find('.modal-description').html(data.modalSettings.edit_modal_description);
		}
		$modal.find('.modal-general-title, .modal-description').show();

		if (!window.hotModalCache) {
			window.hotModalCache = {};
		}
		if (!window.hotModalCache[data.modalSettings.post_id]) {
			window.hotModalCache[data.modalSettings.post_id] = {};
		}

		// Get data for the spreadsheet if necessary
		if (data.modalSettings.edit_modal_get_action) {
			var nonce = jQuery('.remodal-bg').data('nonce');
			jQuery.get(vgse_global_data.ajax_url, {
				action: data.modalSettings.edit_modal_get_action,
				nonce: nonce,
				postId: data.modalSettings.post_id
			}).done(function (response) {
				initHandsontableForPopup(response.data, data.modalSettings);
			});
		} else {

			if (window.hotModalCache && window.hotModalCache[data.modalSettings.post_id][data.modalSettings.edit_modal_save_action]) {
				var objectData = window.hotModalCache[data.modalSettings.post_id][data.modalSettings.edit_modal_save_action];
			} else {
				var objectData = data.existing;
			}
			initHandsontableForPopup(objectData, data.modalSettings);
		}

	});

	jQuery('body').on('click', 'button.remodal-confirm, a.remodal-cancel, .media-button-insert', function (e) {
		if (jQuery(this).attr('type') !== 'submit' && !jQuery(this).hasClass('submit')) {
			e.preventDefault();
		}
	});

});

jQuery(document).ready(function () {
	jQuery('.vgse-current-filters').on('click', '.button', function (e) {
		e.preventDefault();
		var $button = jQuery(this);


		var fullData = hot.getSourceData();
		fullData = beGetModifiedItems(fullData, window.beOriginalData);
		if (fullData.length) {
			alert(vgse_editor_settings.texts.save_changes_before_remove_filter);
			return true;
		}

		var filtersToRemove = [];
		if ($button.hasClass('remove-all-filters')) {
			jQuery('.vgse-current-filters .button:not(.remove-all-filters)').each(function () {
				filtersToRemove.push(jQuery(this).data('filter-key'));
			});
			jQuery('.vgse-current-filters .button').remove();
			jQuery('body').data('be-filters', {});
		} else {
			filtersToRemove.push($button.data('filter-key'));
			$button.remove();
		}

		filtersToRemove.forEach(function (toRemove) {

			if (toRemove) {
				// Clear field in the search form
				jQuery('#be-filters').find('input,select,textarea').filter(function () {
					return jQuery(this).attr('name') === toRemove && (jQuery(this).attr('type') !== 'checkbox');
				}).val('').trigger('change');
				jQuery('#be-filters').find('input:checkbox').filter(function () {
					return jQuery(this).attr('name') === toRemove;
				}).prop('checked', false).trigger('change');

				beAddRowsFilter(toRemove + '=');
			}
		});

		vgseReloadSpreadsheet();

	});
});

/* Post type setup wizard */
jQuery(document).ready(function () {
	var $wrapper = jQuery('.post-type-setup-wizard');

	if (!$wrapper.length) {
		return false;
	}

	// Create post type
	$wrapper.find('form.inline-add').on('submit', function (e) {

		var $form = jQuery(this);
		var callback = $form.data('callback');
		jQuery.ajax({
			method: $form.attr('method'),
			url: $form.attr('action'),
			data: $form.serialize() + '&current_post_type=' + jQuery('.post-types-form input:radio:checked').val()
		})
			.done(function (response) {
				$form.find('input:text').val('');
				$form.find('input:text').first().focus();
				vgseExecuteFunctionByName(callback, window, {
					response: response,
					form: $form,
				});
			});


		return false;
	});

	// Add delete button to custom post types
	var customPostTypes = $wrapper.find('.post-types-form').data('custom-post-types').split(',');
	jQuery.each(customPostTypes, function (index, postType) {
		var $fieldWrapper = $wrapper.find('.post-types-form .post-type-' + postType);
		$fieldWrapper.append('<button class="button vgse-delete-post-type" data-post-type="' + postType + '"><i class="fa fa-remove"></i></button>');
	});

	// Delete post type
	$wrapper.on('click', '.vgse-delete-post-type', function (e) {
		e.preventDefault();
		var $button = jQuery(this);
		var postType = $button.data('post-type');

		var allowed = confirm($wrapper.find('.post-types-form').data('confirm-delete'));

		if (!allowed) {
			return true;
		}
		jQuery.post(vgse_global_data.ajax_url, {
			post_type: postType,
			action: 'vgse_delete_post_type',
			nonce: jQuery('.post-type-setup-wizard').data('nonce'),
		}, function (response) {
			if (response.success) {
				notification({ mensaje: response.data.message, tipo: 'success', tiempo: 3000 });
				$wrapper.find('.post-types-form .post-type-' + postType).remove();
			}
		});
	});
});
function vgsePostTypeSaved(data) {
	if (data.response.success) {
		jQuery('.post-types-form .post-type-field').first().before('<div class="post-type-field"><input type="radio" name="post_types[]" value="' + data.response.data.slug + '" id="' + data.response.data.slug + '"> <label for="' + data.response.data.slug + '">' + data.response.data.label + '</label></div>');
		jQuery('.post-types-form input:radio').first().prop('checked', true);
		jQuery('.post-types-form .save-trigger').trigger('click');
	}
}
function vgsePostTypeSetupPostTypesSaved(data) {
	var $step = data.form.parents('li');

	$step.hide();

	var $next = $step.next();
	$next.show();

	if ($next.hasClass('setup_columns')) {
		jQuery.get(vgse_global_data.ajax_url, {
			action: 'vgse_post_type_setup_columns_visibility',
			nonce: jQuery('.post-type-setup-wizard').data('nonce'),
			post_type: jQuery('.post-types-form input:radio:checked').val(),
		}, function (response) {
			$next.append(response.data.html);

			setTimeout(() => {
				const columnsManager = Alpine.$data(document.querySelector('[x-data="vgseColumnsManager"]'));
				columnsManager.saveChangesInServer = true;
			}, 200);
		});
	}
}

function vgsePostTypeSetupColumnSaved(data) {
	jQuery('#vgse-columns-enabled').append('<li><span class="handle">::</span> ' + data.response.data.label + ' <input type="hidden" name="columns[]" class="js-column-key" value="' + data.response.data.key + '"><input type="hidden" name="columns_names[]" class="js-column-title" value="' + data.response.data.label + '"></li>');
}
function vgsePostTypeSetupColumnsVisibilitySaved(data) {
	window.location.href = data.response.data.post_type_editor_url;
}
jQuery(document).ready(function () {

	var $postTypesAvailable = jQuery('.quick-setup-page-content .post-type-field input');

	if (!$postTypesAvailable.length) {
		return false;
	}

	var $postTypesEnabled = jQuery('.quick-setup-page-content .post-types-enabled');
	$postTypesAvailable.on('change', function (e) {
		console.log('test: ', jQuery(this));
		$postTypesEnabled.empty();

		$postTypesAvailable.each(function () {
			var postTypeKey = jQuery(this).val();

			if (jQuery(this).is(':checked')) {

				var label = jQuery(this).siblings('label').text();
				var html = '<a class="button post-type-' + vgseStripHtml(postTypeKey) + '" href="admin.php?page=vgse-bulk-edit-' + vgseStripHtml(postTypeKey) + '">Edit ' + vgseStripHtml(label) + '</a> - ';
				console.log('html: ', html);
				$postTypesEnabled.append(html);
			}
		});

	});
});

// Update settings in line
jQuery(document).ready(function () {
	jQuery('body').on('change', 'input.wpse-set-settings, textarea.wpse-set-settings, select.wpse-set-settings', function (e) {
		e.preventDefault();

		var name = jQuery(this).attr('name');
		var value = jQuery(this).val();
		var reloadAfterSuccess = parseInt(jQuery(this).data('reload-after-success'));
		var silentAction = parseInt(jQuery(this).data('silent-action'));

		if (!name) {
			return true;
		}

		vgseSetSettings([{
			name: 'settings[' + name + ']',
			value: value,
		}], reloadAfterSuccess, silentAction);
	});
	jQuery('body').on('click', 'a.wpse-set-settings', function (e) {
		e.preventDefault();

		var name = jQuery(this).data('name');
		var value = jQuery(this).data('value');
		var reloadAfterSuccess = parseInt(jQuery(this).data('reload-after-success'));
		var silentAction = parseInt(jQuery(this).data('silent-action'));

		if (!name) {
			return true;
		}

		vgseSetSettings([{
			name: 'settings[' + name + ']',
			value: value,
		}], reloadAfterSuccess, silentAction);
	});
	jQuery('body').on('submit', 'form.wpse-set-settings', function (e) {
		var reloadAfterSuccess = parseInt(jQuery(this).data('reload-after-success'));
		var silentAction = parseInt(jQuery(this).data('silent-action'));

		vgseSetSettings(jQuery(this).serializeArray(), reloadAfterSuccess, silentAction);
		return false;
	});

	// Settings tabs
	jQuery('.tabs-links a').on('click', function (e) {
		e.preventDefault();
		jQuery('.tabs-links a').removeClass('tab-active');
		jQuery(this).addClass('tab-active');

		var id = jQuery(this).attr('href').replace('#', '');
		var $links = jQuery(this).parents('.tabs-links');
		var $content = $links.next().find('.' + id);

		$links.next().find('.tab-content').hide();
		$content.show();
	});
	jQuery('.tabs-links').each(function () {
		jQuery(this).find('a').first().click();
	});
});

// Helper functionality for tools with saved items
jQuery(document).ready(function () {
	if (typeof vgse_editor_settings === 'undefined' || !vgse_editor_settings.is_administrator) {
		return;
	}
	// Allow to delete saved search
	var $buttons = jQuery('.toolbar-submenu [data-saved-item]');
	$buttons.each(function () {
		var $button = jQuery(this);
		$button.after('<button type="button" class="wpse-delete-saved-item wpse-delete-saved-search">x</button>');
	});

	jQuery('body').on('click', '.wpse-delete-saved-item', function (e) {
		e.preventDefault();
		var $button = jQuery(this);
		var confirmationTextKey = 'confirm_delete_' + $button.prev().data('saved-type') + '_item';
		if (vgse_editor_settings.texts[confirmationTextKey] && !confirm(vgse_editor_settings.texts[confirmationTextKey])) {
			return false;
		}

		var requestArgs = {
			nonce: jQuery('#vgse-wrapper').data('nonce'),
			post_type: jQuery('#post-data').data('post-type'),
			action: 'vgse_delete_saved_' + $button.prev().data('saved-type'),
			search_name: $button.prev().data('item-name')
		};
		var reload = $button.prev().data('reload');
		$button.parent().remove();
		jQuery.post(vgse_global_data.ajax_url, requestArgs, function (response) {
			if (reload) {
				window.location.reload();
			}
		});
	});
});


jQuery(document).ready(function () {
	if (!jQuery('.vg-toolbar .button-container.require-click-to-expand').length) {
		return true;
	}
	jQuery('.vg-toolbar .require-click-to-expand > button').on('click', function (e) {
		var $parent = jQuery(this).parent();
		var $others = jQuery('.vg-toolbar .require-click-to-expand.expand-submenu').not($parent);
		$others.removeClass('expand-submenu');
		$parent.toggleClass('expand-submenu');
	});
	jQuery('body').on('click', function (e) {
		var $clicked = jQuery(e.target);
		if (jQuery('.button-container.expand-submenu').length && !$clicked.parents('.require-click-to-expand').length && !$clicked.parents('.select2-container').length) {
			jQuery('.vg-toolbar .button-container.require-click-to-expand.expand-submenu').removeClass('expand-submenu');
		}
	});
});

jQuery(document).ready(function () {
	vgseInitLazySelects();
});

jQuery(document).ready(function () {
	// Draggable modals work on desktop only
	if (jQuery(window).width() < 768) {
		return true;
	}
	var $draggableModals = jQuery('.remodal.remodal-draggable');
	if (!$draggableModals.length) {
		return true;
	}
	$draggableModals.each(function () {
		var $modal = jQuery(this);
		$modal.append('<i class="fa fa-arrows drag-modal"></i>');

		dragElement($modal.find('.drag-modal')[0], $modal[0]);
	});


	jQuery(document).on('opened vgseAfterModalContentLoaded', '.remodal', function (e) {
		var $modal = jQuery(this);
		if ($modal.hasClass('remodal-draggable')) {
			// Get the viewport dimensions
			var viewportWidth = jQuery(window).width();
			var viewportHeight = jQuery(window).height();

			// Get the modal dimensions
			var modalWidth = $modal.outerWidth();
			var modalHeight = $modal.outerHeight();

			// Calculate the new position for vertical and horizontal centering
			var leftPosition = (viewportWidth - modalWidth) / 2;
			var topPosition = (viewportHeight - modalHeight) / 2;
			if (topPosition < 0) {
				topPosition = 0;
			}

			// Set the new CSS properties to center the modal
			$modal.css({
				'left': leftPosition,
				'position': 'absolute',
				'top': topPosition
			});
		}
	});
	jQuery(document).on('closed', '.remodal', function (e) {
		var $modal = jQuery(this);
		if ($modal.hasClass('remodal-draggable')) {
			$modal.css({
				left: '',
				position: '',
				top: ''
			});
		}
	});


	// Make the DIV element draggable:
	function dragElement(elmnt, div) {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		if (document.getElementById(elmnt.id + "header")) {
			// if present, the header is where you move the DIV from:
			document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
		} else {
			// otherwise, move the DIV from anywhere inside the DIV:
			elmnt.onmousedown = dragMouseDown;
		}

		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			// div.style.position = 'absolute';
			document.onmouseup = closeDragElement;
			// call a function whenever the cursor moves:
			document.onmousemove = elementDrag;
		}

		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			// calculate the new cursor position:
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			// set the element's new position:
			div.style.top = (div.offsetTop - pos2) + "px";
			div.style.left = (div.offsetLeft - pos1) + "px";
		}

		function closeDragElement() {
			// stop moving when mouse button is released:
			document.onmouseup = null;
			document.onmousemove = null;
		}
	}
});

jQuery(document).ready(function () {
	var $ = jQuery;


	jQuery(document).on('opening', '.remodal[data-ajax-action]', function () {
		getAjaxContent(jQuery(this));
	});

	jQuery(document).on('closed', '.remodal[data-ajax-action]', function () {
		var intervalId = parseInt(jQuery(this).data('intervalId'));
		if (intervalId) {
			clearInterval(intervalId);
			jQuery(this).data('intervalId', false);
		}
	});

	jQuery(document).on('vgSheetEditor:refreshRemodalContent', '.remodal[data-ajax-action]', function () {
		// Only refresh the content of the popup that's visible
		if (jQuery(this).is(':visible')) {
			getAjaxContent(jQuery(this));
		}
	});

	function getAjaxContent($modal) {
		$.get(vgse_global_data.ajax_url, {
			action: $modal.data('ajax-action'),
			nonce: jQuery('.remodal-bg').data('nonce'),
			postType: vgse_editor_settings.post_type,
			post_type: vgse_editor_settings.post_type,
			is_editor_page: true
		}, function (response) {
			if (response.success) {
				var $newModal = jQuery(response.data.html);
				if (!$modal.hasClass('custom-ajax-insert')) {
					$modal.find('.modal-content').replaceWith($newModal.find('.modal-content'));
				}
				$modal.removeClass('lazy-modal-content');
				$modal.trigger('vgSheetEditor:remodal:ajaxContentInserted', response);
				$('body').trigger('vgSheetEditor:remodal:ajaxContentInserted', response);
				if ($modal.data('live-refresh') && !$modal.data('intervalId')) {
					var intervalId = setInterval(function () {
						if (!$modal.data('pauseAutoReload')) {
							getAjaxContent($modal);
						}
					}, parseInt($modal.data('live-refresh')) * 1000);
					$modal.data('intervalId', intervalId);
				}
			}
		});
	}
});
jQuery(document).ready(function () {

	if (typeof hot === 'undefined') {
		return true;
	}
	/**
	 * Disable post status cells that contain readonly statuses.
	 * ex. scheduled posts
	 */
	hot.updateSettings({
		cells: function (row, col, prop) {
			var visualRowIndex = this.instance.toVisualRow(row);
			var cellProperties = {};
			var currentClasses = this.className || '';
			//			var anyLockCheckSucceded = false;

			// Set column backgrounds
			currentClasses = currentClasses.replace(/bg-[a-z0-9]+/gi, '');
			if (typeof vgse_editor_settings.columnsBackgroundColors === 'object' && typeof vgse_editor_settings.columnsBackgroundColors[prop] === 'string' && vgse_editor_settings.columnsBackgroundColors[prop]) {
				currentClasses += ' bg-' + vgse_editor_settings.columnsBackgroundColors[prop].replace('#', '');
			}

			if (window.wpseAiLoadingCells) {
				if (window.wpseAiLoadingCells[visualRowIndex + '-' + col] && currentClasses.indexOf('ai-loading') < 0) {
					currentClasses += ' ai-loading';
				} else if (!window.wpseAiLoadingCells[visualRowIndex + '-' + col]) {
					currentClasses = currentClasses.replace(/ai-loading/g, '').trim();
				}
			}

			if (vgse_editor_settings.add_html_class_status_value && prop === 'post_status') {
				currentClasses = currentClasses.replace(/status-[a-zA-Z]+/g, '');

				var cellData = hot.getDataAtCell(visualRowIndex, col);
				if (cellData) {
					currentClasses += ' status-' + cellData.replace(/[^a-zA-Z]+/g, '');
				}
			}
			cellProperties.className = currentClasses;

			var columnSettings = vgse_editor_settings.final_spreadsheet_columns_settings[prop];
			if (columnSettings) {
				if (!columnSettings.is_locked && (vgse_editor_settings.watch_cells_to_lock || prop === 'post_status')) {
					var cellData = hot.getDataAtCell(visualRowIndex, col);
					if (cellData && typeof cellData === 'string' && cellData.indexOf('vg-cell-blocked') > -1) {
						cellProperties.renderer = 'wp_locked';
						cellProperties.readOnly = true;
						cellProperties.editor = false;
						cellProperties.fillHandle = false;


						if (vgse_editor_settings.allow_cell_comments) {
							var rowPostType = hot.getDataAtRowProp(visualRowIndex, 'post_type');
							if (rowPostType === 'product_variation' && vgse_editor_settings.texts.column_for_parent_products_only) {
								cellProperties.comment = { value: vgse_editor_settings.texts.column_for_parent_products_only };
							} else if (rowPostType === 'product' && vgse_editor_settings.texts.column_for_variations_only) {
								cellProperties.comment = { value: vgse_editor_settings.texts.column_for_variations_only };
							}
						}
						//						anyLockCheckSucceded = true;
					}
				}

				if (columnSettings.is_locked && columnSettings.allow_to_save && vgse_editor_settings.lockedColumnsManuallyEnabled.indexOf(prop) > -1) {
					cellProperties = columnSettings.formatted;
					cellProperties.readOnly = false;
					cellProperties.fillHandle = true;
					cellProperties.renderer = columnSettings.formatted.renderer && columnSettings.formatted.renderer !== 'wp_locked' ? columnSettings.formatted.renderer : 'text';
					//					anyLockCheckSucceded = true;
				}

				// If the cell didn't need locking, make sure we reset the original properties.
				// This is needed because handsontable saves the custom properties based on row index, so if we sort rows, one row that shouldn't have locked cells
				// will show locked cells if the row that used to be in that index had locked cells.
				//				if (!anyLockCheckSucceded) {
				//					cellProperties = columnSettings.formatted;
				//					cellProperties.readOnly = false;
				//					cellProperties.fillHandle = true;
				//					cellProperties.renderer = columnSettings.formatted.renderer || 'text';
				//				}

				if (vgse_editor_settings.post_type === vgse_editor_settings.woocommerce_product_post_type_key && prop === 'post_status') {
					cellProperties.selectOptions = columnSettings.formatted.selectOptions;
					var cellData = hot.getDataAtCell(visualRowIndex, col);
					var rowPostType = hot.getDataAtRowProp(visualRowIndex, 'post_type');
					if (rowPostType === 'product_variation') {
						cellProperties.selectOptions = {
							'publish': cellProperties.selectOptions.publish,
							'delete': cellProperties.selectOptions.delete
						};
					}
				}
			}

			return cellProperties;
		}
	});
});


(function (Handsontable) {
    "use strict";

    var WPChosenEditor = Handsontable.editors.SelectEditor.prototype.extend();
    WPChosenEditor.prototype.prepare = function (row, col, prop, td, originalValue, cellProperties) {
        Handsontable.editors.SelectEditor.prototype.prepare.apply(this, arguments);

        this.options = {};
        if (this.cellProperties.chosenOptions) {
            this.options = jQuery.extend(this.options, cellProperties.chosenOptions);
        }

        if( this.options.multiple ){
            this.select.setAttribute("multiple", "multiple");
        }
        cellProperties.chosenOptions = jQuery.extend({}, cellProperties.chosenOptions);
    };

    WPChosenEditor.prototype.init = function () {
        Handsontable.editors.SelectEditor.prototype.init.apply(this, arguments);
        this.createElements();
    };

    WPChosenEditor.prototype.createElements = function () {
        this.$body = jQuery(document.body);
        this.$select = jQuery(this.select);

        this.TEXTAREA_PARENT = document.createElement('DIV');
        Handsontable.dom.addClass(this.TEXTAREA_PARENT, 'handsontableInputHolder');

        this.textareaParentStyle = this.TEXTAREA_PARENT.style;
        this.textareaParentStyle.top = 0;
        this.textareaParentStyle.left = 0;
        this.textareaParentStyle.display = 'none';
        this.textareaParentStyle.width = "200px";

        this.TEXTAREA_PARENT.appendChild(this.select);
        this.$parent = jQuery(this.TEXTAREA_PARENT);

        this.instance.rootElement.appendChild(this.TEXTAREA_PARENT);

        var that = this;
        this.instance._registerTimeout(setTimeout(function () {
            that.refreshDimensions();
        }, 0));
    };
    WPChosenEditor.prototype.open = function (keyboardEvent) {
        this.instance.addHook('beforeKeyDown', onBeforeKeyDown);
        Handsontable.editors.SelectEditor.prototype.open.apply(this, arguments);
        this.$parent.css({
            display: 'block',
            top: this.$select.css('top'),
            left: this.$select.css('left'),
            margin: this.$select.css('margin'),
        });

        this.$select.css({
            height: jQuery(this.TD).height() + 4,
            'min-width': jQuery(this.TD).outerWidth() - 4
        });

        // Hide the select
        this.$select.hide();


        var options = jQuery.extend({}, this.options, {
            width: "100%",
            search_contains: true
        });

        if (jQuery(this.TEXTAREA_PARENT).find(".chosen-container").length) {
            this.$select.chosen("destroy");
        }

        this.$select.chosen(options);

        var self = this;
        if (typeof window.wpseChosenTerms === 'undefined') {
            window.wpseChosenTerms = {};
        }
        if (this.options.ajaxParams) {
            this.options.ajaxParams.nonce = jQuery('.remodal-bg').data('nonce');
            this.options.ajaxParams.columnKey = self.prop;
            this.options.ajaxParams.wpse_source = 'chosen_column';
            this.options.ajaxParams.post_type = vgse_editor_settings.post_type;
            this.$parent.find('.search-field').addClass('wpse-is-loading');
            if (typeof window.wpseChosenTerms[self.prop] === 'undefined') {
                jQuery.ajax({
                    url: vgse_global_data.ajax_url,
                    dataType: 'json',
                    data: this.options.ajaxParams,
                    success: function (response) {
                        console.log("response", response);
                        if(response.data.data){
                            response.data = response.data.data;
                        }
                        window.wpseChosenTerms[self.prop] = response.data;
                        self.processAjaxDropdownOptions(window.wpseChosenTerms[self.prop]);
                    }
                });
            } else {
                self.processAjaxDropdownOptions(window.wpseChosenTerms[self.prop]);
            }
        } else {            
            var selectOptions = [];
            this.$select.find('option').each(function(){
                selectOptions.push( jQuery(this).attr('value') );
            });
            window.wpseChosenTerms[self.prop] = selectOptions;
            self.processAjaxDropdownOptions(selectOptions);
        }

        setTimeout(function () {

            self.$select.on('change', onChosenChanged.bind(self));
            self.$select.on('chosen:hiding_dropdown', onChosenClosed.bind(self));

            self.$select.trigger("chosen:open");

            jQuery(self.TEXTAREA_PARENT).find("input.chosen-search-input").on("keydown", function (e) {
                if (e.keyCode === Handsontable.helper.KEY_CODES.ENTER /*|| e.keyCode === Handsontable.helper.KEY_CODES.BACKSPACE*/) {
                    if (jQuery(this).val()) {
                        e.preventDefault();
                        e.stopPropagation();
                    } else {
                        e.preventDefault();
                        e.stopPropagation();
                        self.close();
                        self.finishEditing();
                    }

                }

                if (e.keyCode === Handsontable.helper.KEY_CODES.BACKSPACE) {
                    var txt = jQuery(self.TEXTAREA_PARENT).find("input").val();

                    jQuery(self.TEXTAREA_PARENT).find("input").val(txt.substr(0, txt.length - 1)).trigger("keyup.chosen");

                    e.preventDefault();
                    e.stopPropagation();
                }

                if (e.keyCode === Handsontable.helper.KEY_CODES.ARROW_DOWN || e.keyCode === Handsontable.helper.KEY_CODES.ARROW_UP) {
                    e.preventDefault();
                    e.stopPropagation();
                }

            });

            setTimeout(function () {
                self.$select.trigger("chosen:activate").focus();

                if (keyboardEvent && keyboardEvent.keyCode && keyboardEvent.keyCode != 113) {
                    var key = keyboardEvent.keyCode;
                    var keyText = (String.fromCharCode((96 <= key && key <= 105) ? key - 48 : key)).toLowerCase();

                    jQuery(self.TEXTAREA_PARENT).find("input").val(keyText).trigger("keyup.chosen");
                    self.$select.trigger("chosen:activate");
                }
            }, 1);
        }, 1);
    };
    WPChosenEditor.prototype.processAjaxDropdownOptions = function (rawData) {
        var data = typeof rawData === 'object' ? rawData : [];
        var self = this;
        var currentValue = this.originalValue;
        self.$select.empty();
        data.forEach(function (term) {
            var $option = jQuery('<option/>').attr('value', vgseStripHtml(term)).text(vgseStripHtml(term));
            self.$select.append($option);
        });
        self.$select.trigger("chosen:updated");
        self.setValue(currentValue);
        self.$parent.find('.search-field').removeClass('wpse-is-loading');
    }

    var onChosenChanged = function (event, params) {

        // Move the selected option to the end of the list, because newly selected
        // options should appear at the end of the value sent to the DB
        if (params && params.selected) {
            this.$select.find('option').filter(function(){
                return jQuery(this).val() === params.selected;
            }).appendTo(this.$select);

            // Update chosen to recognize the new order of options and prevent weird bugs
            this.$select.trigger("chosen:updated");
        }
    };
    var onChosenClosed = function () {
        var options = this.cellProperties.chosenOptions;

        if (!options.multiple) {
            this.close();
            this.finishEditing();
        }
    };
    var onBeforeKeyDown = function (event) {
        var instance = this;
        var that = instance.getActiveEditor();

        var keyCodes = Handsontable.helper.KEY_CODES;
        var ctrlDown = (event.ctrlKey || event.metaKey) && !event.altKey; //catch CTRL but not right ALT (which in some systems triggers ALT+CTRL)

        //Process only events that have been fired in the editor
        if (event.target.tagName !== "INPUT") {
            return;
        }
        if (event.keyCode === 17 || event.keyCode === 224 || event.keyCode === 91 || event.keyCode === 93) {
            //when CTRL or its equivalent is pressed and cell is edited, don't prepare selectable text in textarea
            event.stopImmediatePropagation();
            return;
        }

        var target = event.target;

        switch (event.keyCode) {
            case keyCodes.ARROW_RIGHT:
                if (Handsontable.dom.getCaretPosition(target) !== target.value.length) {
                    event.stopImmediatePropagation();
                } else {
                    that.$select.trigger("chosen:close");
                }
                break;

            case keyCodes.ARROW_LEFT:
                if (Handsontable.dom.getCaretPosition(target) !== 0) {
                    event.stopImmediatePropagation();
                } else {
                    that.$select.trigger("chosen:close");
                }
                break;

            case keyCodes.ENTER:
                if (that.cellProperties.chosenOptions.multiple) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    event.stopPropagation();
                }

                break;

            case keyCodes.A:
            case keyCodes.X:
            case keyCodes.C:
            case keyCodes.V:
                if (ctrlDown) {
                    event.stopImmediatePropagation(); //CTRL+A, CTRL+C, CTRL+V, CTRL+X should only work locally when cell is edited (not in table context)
                }
                break;

            case keyCodes.BACKSPACE:
                var txt = jQuery(that.TEXTAREA_PARENT).find("input").val();
                jQuery(that.TEXTAREA_PARENT).find("input").val(txt.substr(0, txt.length - 1)).trigger("keyup.chosen");

                event.stopImmediatePropagation();
                break;
            case keyCodes.DELETE:
            case keyCodes.HOME:
            case keyCodes.END:
                event.stopImmediatePropagation(); //backspace, delete, home, end should only work locally when cell is edited (not in table context)
                break;
        }

    };
    WPChosenEditor.prototype.close = function () {
        this.setValue(this.getValue());
        Handsontable.editors.SelectEditor.prototype.close.apply(this, arguments);
        this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
        this.$parent.hide();
        this.$select.off();
        this.$select.hide();
    };
    WPChosenEditor.prototype.finishEditing = function (isCancelled, ctrlDown) {
        return Handsontable.editors.SelectEditor.prototype.finishEditing.apply(this, arguments);
    };

    WPChosenEditor.prototype.beginEditing = function (initialValue, event ) {
        var onBeginEditing = this.instance.getSettings().onBeginEditing;
        if (onBeginEditing && onBeginEditing() === false) {
            return;
        }

        var self = this;
        // If this is a keyboard event and they pressed Enter, delay the Chosen opening because
        // Chosen will automatically close the dropdown if it detects the keyup event with the Enter key
        // The 250ms is enough time to release the Enter key so Chosen can remain open.
        // If they haven't pressed Enter, open the editor inmediately.
        if( event instanceof KeyboardEvent && event.key === 'Enter'){
            setTimeout(function(){
                Handsontable.editors.SelectEditor.prototype.beginEditing.apply(self, arguments);
            }, 250);
        } else {
            Handsontable.editors.SelectEditor.prototype.beginEditing.apply(this, arguments);
        }

    };
    WPChosenEditor.prototype.getValue = function () {
        var selectedValues = getSelectValues(this.select);
        var valuesString = jQuery.unique(selectedValues).join(vgse_editor_settings.taxonomy_terms_separator + " ");
        return valuesString;
    };
    WPChosenEditor.prototype.setValue = function (valueString) {
        
        if (typeof valueString === 'string') {
            if( this.options.multiple  ){
                var valueArray = (valueString + "").split(vgse_editor_settings.taxonomy_terms_separator).map(function (item) {
                    return item.trim();
                });
            } else {
                var valueArray = [ valueString ];
            }
        } else {
            var valueArray = valueString;
        }
        var that = this;
        valueArray = jQuery.unique(valueArray);
        valueArray.forEach(function (singleValue) {
            var $option = that.$select.find('option').filter(function(){
                return jQuery(this).val() === singleValue;
            }).first();
            $option.prop('selected', true);
            that.$select.append($option);

            if( window.wpseChosenTerms && window.wpseChosenTerms[that.prop] && window.wpseChosenTerms[that.prop].indexOf(singleValue) < 0 ){
                window.wpseChosenTerms[that.prop].push(singleValue);
            }
        });
        this.$select.trigger('change');
        this.$select.trigger('chosen:updated');
        var currentValues = this.$select.val();

        // Change the original value only after the select options have loaded
        if( this.$select.find('option').length ){
            this.originalValue = valueArray.join(vgse_editor_settings.taxonomy_terms_separator + " ");
        }
    };
    function getSelectValues(select) {
        var result = [];
        var options = select && select.options;
        var opt;

        for (var i = 0, iLen = options.length; i < iLen; i++) {
            opt = options[i];
            var optionValue = opt.value || opt.text;
            if (opt.selected && optionValue) {
                result.push(optionValue);
            }
        }
        return result;
    }
    Handsontable.editors.WPChosenEditor = WPChosenEditor;
    Handsontable.editors.registerEditor('wp_chosen', WPChosenEditor);
})(Handsontable);


/*This is a fork from https://github.com/mydea/handsontable-chosen-editor/
Modified to use vgse_editor_settings.taxonomy_terms_separator as the term separator instead of 
hardcoded commas.*/
/// chosen plugin
(function (Handsontable) {
    "use strict";

    var ChosenEditor = Handsontable.editors.TextEditor.prototype.extend();

    ChosenEditor.prototype.prepare = function (row, col, prop, td, originalValue, cellProperties) {

        Handsontable.editors.TextEditor.prototype.prepare.apply(this, arguments);

        this.options = {};

        if (this.cellProperties.chosenOptions) {
            this.options = jQuery.extend(this.options, cellProperties.chosenOptions);
        }

        cellProperties.chosenOptions = jQuery.extend({}, cellProperties.chosenOptions);
    };

    ChosenEditor.prototype.createElements = function () {
        this.$body = jQuery(document.body);

        this.TEXTAREA = document.createElement('select');

        // Handsontable copy paste plugin calls this.TEXTAREA.select()
        this.TEXTAREA.select = function () { };

        //this.TEXTAREA.setAttribute('type', 'text');
        this.$textarea = jQuery(this.TEXTAREA);

        Handsontable.dom.addClass(this.TEXTAREA, 'handsontableInput');

        this.textareaStyle = this.TEXTAREA.style;
        this.textareaStyle.width = 0;
        this.textareaStyle.height = 0;

        this.TEXTAREA_PARENT = document.createElement('DIV');
        Handsontable.dom.addClass(this.TEXTAREA_PARENT, 'handsontableInputHolder');

        this.textareaParentStyle = this.TEXTAREA_PARENT.style;
        this.textareaParentStyle.top = 0;
        this.textareaParentStyle.left = 0;
        this.textareaParentStyle.display = 'none';
        this.textareaParentStyle.width = "200px";

        this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);

        this.instance.rootElement.appendChild(this.TEXTAREA_PARENT);

        var that = this;
        this.instance._registerTimeout(setTimeout(function () {
            that.refreshDimensions();
        }, 0));
    };

    var onChosenChanged = function () {
        var options = this.cellProperties.chosenOptions;

        if (!options.multiple) {
            this.close();
            this.finishEditing();
        }
    };
    var onChosenClosed = function () {
        var options = this.cellProperties.chosenOptions;

        if (!options.multiple) {
            this.close();
            this.finishEditing();
        } else {
        }
    };
    var onBeforeKeyDown = function (event) {
        var instance = this;
        var that = instance.getActiveEditor();

        var keyCodes = Handsontable.helper.KEY_CODES;
        var ctrlDown = (event.ctrlKey || event.metaKey) && !event.altKey; //catch CTRL but not right ALT (which in some systems triggers ALT+CTRL)

        //Process only events that have been fired in the editor
        if (event.target.tagName !== "INPUT") {
            return;
        }
        if (event.keyCode === 17 || event.keyCode === 224 || event.keyCode === 91 || event.keyCode === 93) {
            //when CTRL or its equivalent is pressed and cell is edited, don't prepare selectable text in textarea
            event.stopImmediatePropagation();
            return;
        }

        var target = event.target;

        switch (event.keyCode) {
            case keyCodes.ARROW_RIGHT:
                if (Handsontable.dom.getCaretPosition(target) !== target.value.length) {
                    event.stopImmediatePropagation();
                } else {
                    that.$textarea.trigger("chosen:close");
                }
                break;

            case keyCodes.ARROW_LEFT:
                if (Handsontable.dom.getCaretPosition(target) !== 0) {
                    event.stopImmediatePropagation();
                } else {
                    that.$textarea.trigger("chosen:close");
                }
                break;

            case keyCodes.ENTER:
                if (that.cellProperties.chosenOptions.multiple) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    event.stopPropagation();
                }

                break;

            case keyCodes.A:
            case keyCodes.X:
            case keyCodes.C:
            case keyCodes.V:
                if (ctrlDown) {
                    event.stopImmediatePropagation(); //CTRL+A, CTRL+C, CTRL+V, CTRL+X should only work locally when cell is edited (not in table context)
                }
                break;

            case keyCodes.BACKSPACE:
                var txt = jQuery(that.TEXTAREA_PARENT).find("input").val();
                jQuery(that.TEXTAREA_PARENT).find("input").val(txt.substr(0, txt.length - 1)).trigger("keyup.chosen");

                event.stopImmediatePropagation();
                break;
            case keyCodes.DELETE:
            case keyCodes.HOME:
            case keyCodes.END:
                event.stopImmediatePropagation(); //backspace, delete, home, end should only work locally when cell is edited (not in table context)
                break;
        }

    };

    ChosenEditor.prototype.open = function (keyboardEvent) {
        this.refreshDimensions();
        this.textareaParentStyle.display = 'block';
        this.instance.addHook('beforeKeyDown', onBeforeKeyDown);

        this.$textarea.css({
            height: jQuery(this.TD).height() + 4,
            'min-width': jQuery(this.TD).outerWidth() - 4
        });

        //display the list
        this.$textarea.hide();

        //make sure that list positions matches cell position
        //this.$textarea.offset(jQuery(this.TD).offset());

        var options = jQuery.extend({}, this.options, {
            width: "100%",
            search_contains: true
        });

        if (options.multiple) {
            this.$textarea.attr("multiple", true);
        } else {
            this.$textarea.attr("multiple", false);
        }

        this.$textarea.empty();
        this.$textarea.append("<option value=''></option>");
        var el = null;
        var originalValue = (this.originalValue + "").split(vgse_editor_settings.taxonomy_terms_separator).map(function (item) {
            return item.trim();
        });
        if (options.data && options.data.length) {
            for (var i = 0; i < options.data.length; i++) {
                el = jQuery("<option />");
                el.attr("value", options.data[i].id);
                el.html(options.data[i].label);

                if (originalValue.indexOf(options.data[i].id + "") > -1) {
                    el.attr("selected", true);
                }

                this.$textarea.append(el);
            }
        }

        if (jQuery(this.TEXTAREA_PARENT).find(".chosen-container").length) {
            this.$textarea.chosen("destroy");
        }

        this.$textarea.chosen(options);

        var self = this;
        setTimeout(function () {

            self.$textarea.on('change', onChosenChanged.bind(self));
            self.$textarea.on('chosen:hiding_dropdown', onChosenClosed.bind(self));

            self.$textarea.trigger("chosen:open");

            jQuery(self.TEXTAREA_PARENT).find("input").on("keydown", function (e) {
                if (e.keyCode === Handsontable.helper.KEY_CODES.ENTER /*|| e.keyCode === Handsontable.helper.KEY_CODES.BACKSPACE*/) {
                    if (jQuery(this).val()) {
                        e.preventDefault();
                        e.stopPropagation();
                    } else {
                        e.preventDefault();
                        e.stopPropagation();

                        self.close();
                        self.finishEditing();
                    }

                }

                if (e.keyCode === Handsontable.helper.KEY_CODES.BACKSPACE) {
                    var txt = jQuery(self.TEXTAREA_PARENT).find("input").val();

                    jQuery(self.TEXTAREA_PARENT).find("input").val(txt.substr(0, txt.length - 1)).trigger("keyup.chosen");

                    e.preventDefault();
                    e.stopPropagation();
                }

                if (e.keyCode === Handsontable.helper.KEY_CODES.ARROW_DOWN || e.keyCode === Handsontable.helper.KEY_CODES.ARROW_UP) {
                    e.preventDefault();
                    e.stopPropagation();
                }

            });

            setTimeout(function () {
                self.$textarea.trigger("chosen:activate").focus();

                if (keyboardEvent && keyboardEvent.keyCode && keyboardEvent.keyCode != 113) {
                    var key = keyboardEvent.keyCode;
                    var keyText = (String.fromCharCode((96 <= key && key <= 105) ? key - 48 : key)).toLowerCase();

                    jQuery(self.TEXTAREA_PARENT).find("input").val(keyText).trigger("keyup.chosen");
                    self.$textarea.trigger("chosen:activate");
                }
            }, 1);
        }, 1);

    };

    ChosenEditor.prototype.init = function () {
        Handsontable.editors.TextEditor.prototype.init.apply(this, arguments);
    };

    ChosenEditor.prototype.close = function () {
        this.instance.listen();
        this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
        this.$textarea.off();
        this.$textarea.hide();
        Handsontable.editors.TextEditor.prototype.close.apply(this, arguments);
    };

    ChosenEditor.prototype.getValue = function () {
        if (!this.$textarea.val()) {
            return "";
        }
        if (typeof this.$textarea.val() === "object") {
            return this.$textarea.val().join(vgse_editor_settings.taxonomy_terms_separator);
        }
        return this.$textarea.val();
    };


    ChosenEditor.prototype.focus = function () {
        this.instance.listen();

        // DO NOT CALL THE BASE TEXTEDITOR FOCUS METHOD HERE, IT CAN MAKE THIS EDITOR BEHAVE POORLY AND HAS NO PURPOSE WITHIN THE CONTEXT OF THIS EDITOR
        //Handsontable.editors.TextEditor.prototype.focus.apply(this, arguments);
    };

    ChosenEditor.prototype.beginEditing = function (initialValue) {
        var onBeginEditing = this.instance.getSettings().onBeginEditing;
        if (onBeginEditing && onBeginEditing() === false) {
            return;
        }

        Handsontable.editors.TextEditor.prototype.beginEditing.apply(this, arguments);

    };

    ChosenEditor.prototype.finishEditing = function (isCancelled, ctrlDown) {
        this.instance.listen();
        return Handsontable.editors.TextEditor.prototype.finishEditing.apply(this, arguments);
    };

    Handsontable.editors.ChosenEditor = ChosenEditor;
    Handsontable.editors.registerEditor('chosen', ChosenEditor);

})(Handsontable);
