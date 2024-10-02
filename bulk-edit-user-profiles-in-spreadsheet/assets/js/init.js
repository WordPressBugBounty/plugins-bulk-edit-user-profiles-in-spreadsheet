
// Display WC totals
jQuery(document).ready(function () {
	jQuery('body').on('vgSheetEditor:beforeRowsInsert', function (event, response) {
		console.log('event', event, 'response', response);

		if (typeof response.data.wc_totals === 'undefined') {
			return true;
		}

		jQuery('#responseConsole .wc-totals').remove();
		jQuery.each(response.data.wc_totals, function (label, value) {
			jQuery('#responseConsole').append('<span class="wc-totals">. <b>' + label + '</b>: ' + value + '</span>');
		});
	});
});