<?php defined( 'ABSPATH' ) || exit;
if (!class_exists('WP_Sheet_Editor_Popup_Teaser')) {

	/**
	 * Display Popup to tease users of the free 
	 * version into purchasing the premium plugin.
	 */
	class WP_Sheet_Editor_Popup_Teaser {

		private static $instance = false;

		private function __construct() {
			
		}

		function init() {
			if (!is_admin()) {
				return;
			}
			// All the premium plugins include the custom-columns module, 
			// so we wont show the upgrade message when this module exists
			if (class_exists('WP_Sheet_Editor_Custom_Columns')) {
				return;
			}
			if(VGSE()->get_option('be_disable_extension_offerings')){
				return;
			}
			add_action('vg_sheet_editor/editor_page/after_console_text', array($this, 'notify_free_limitations_above_table'), 30, 1);
			add_action('vg_sheet_editor/editor_page/after_content', array($this, 'move_console_bar_to_header'), 30, 1);
//			add_action('vg_sheet_editor/editor_page/before_toolbars', array($this, 'render_teaser'));
		}

		function post_type_allowed($post_type) {

			$products_post_type = apply_filters('vg_sheet_editor/woocommerce/product_post_type_key', 'product');
			if (in_array($post_type, array('user', $products_post_type), true)) {
				return false;
			}
			return true;
		}

		function move_console_bar_to_header($post_type) {
			if (!$this->post_type_allowed($post_type)) {
				return;
			}
			$this->auto_open_extensions_popup_once();
		}

		function notify_free_limitations_above_table($post_type) {
			if (!$this->post_type_allowed($post_type)) {
				return;
			}
			?>
			. <b><?php esc_html_e('Upgrade:', 'vg_sheet_editor'); ?></b> <?php esc_html_e('Export, import, edit in Excel or Google Sheets; bulk edit thousands of rows at once, edit all the fields from other plugins, and more.', 'vg_sheet_editor'); ?> <a href="<?php echo esc_url( VGSE()->get_buy_link('sheet-console-upgrade-{post_type}') ); ?>" target="_blank" class="upgrade-link"><?php esc_html_e('Upgrade and Save Days of Work', 'vg_sheet_editor'); ?></a>
			<?php
		}

		function render_teaser($post_type) {
			if (defined('VGSE_ANY_PREMIUM_ADDON') && VGSE_ANY_PREMIUM_ADDON) {
				return;
			}

			if ($post_type !== apply_filters('vg_sheet_editor/woocommerce/product_post_type_key', 'product')) {
				?>
				<div class="teaser"><b><?php
						if ($post_type === 'user') {
							esc_html_e('Do you want to: View/Edit WooCommerce Customers in the Spreadsheet, Search Users, Edit Custom Fields, Update in bulk using Formulas, or Edit Posts?', 'vg_sheet_editor');
						} elseif ($post_type === apply_filters('vg_sheet_editor/woocommerce/product_post_type_key', 'product')) {
							esc_html_e('Edit Variable Products, Variations, Attributes, Download Files, Make Advanced searches, Update hundreds of rows with Formulas', 'vg_sheet_editor');
						} else {
							esc_html_e( 'Do you want to: Edit WooCommerce products, Custom Post Types, Custom Fields, Update hundreds of posts using Formulas, or use Advanced Search?', 'vg_sheet_editor');
						}
						?> </b> . <a href="#" class="button button-primary button-primary" data-remodal-target="modal-extensions"><?php esc_html_e('View Extensions', 'vg_sheet_editor' ); ?></a></div>
						<?php
						$this->auto_open_extensions_popup_once();
					}
				}

				function auto_open_extensions_popup_once() {

					$flag_key = 'vgse_hide_extensions_popup';
					if (!get_option($flag_key)) {
						update_option($flag_key, 1);
						?>

				<script>
					setTimeout(function () {
						jQuery('[data-remodal-target="modal-extensions"]').first().trigger('click');
					}, 180000);
				</script>
				<?php
			}
		}

		/**
		 * Creates or returns an instance of this class.
		 *
		 * 
		 */
		static function get_instance() {
			if (null == WP_Sheet_Editor_Popup_Teaser::$instance) {
				WP_Sheet_Editor_Popup_Teaser::$instance = new WP_Sheet_Editor_Popup_Teaser();
				WP_Sheet_Editor_Popup_Teaser::$instance->init();
			}
			return WP_Sheet_Editor_Popup_Teaser::$instance;
		}

		function __set($name, $value) {
			$this->$name = $value;
		}

		function __get($name) {
			return $this->$name;
		}

	}

}


add_action('vg_sheet_editor/after_init', 'vgse_init_Popup_teaser');

if (!function_exists('vgse_init_Popup_teaser')) {

	function vgse_init_Popup_teaser() {
		WP_Sheet_Editor_Popup_Teaser::get_instance();
	}

}
