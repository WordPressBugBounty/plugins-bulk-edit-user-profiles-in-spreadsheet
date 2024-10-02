<?php

defined( 'ABSPATH' ) || exit;
/*
  Plugin Name: WP Sheet Editor - Users
  Description: Edit users in spreadsheet.
  Version: 1.5.36
  Author:      WP Sheet Editor
  Author URI:  https://wpsheeteditor.com/?utm_source=wp-admin&utm_medium=plugins-list&utm_campaign=users
  Plugin URI: https://wpsheeteditor.com/extensions/edit-users-spreadsheet/?utm_source=wp-admin&utm_medium=plugins-list&utm_campaign=users
  License:     GPL2
  License URI: https://www.gnu.org/licenses/gpl-2.0.html
  WC requires at least: 4.0
  WC tested up to: 9.1
  Text Domain: vg_sheet_editor_users
  Domain Path: /lang
*/
if ( isset( $_GET['wpse_troubleshoot8987'] ) ) {
    return;
}
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
if ( function_exists( 'beupis_fs' ) ) {
    beupis_fs()->set_basename( false, __FILE__ );
}
if ( !defined( 'VGSE_USERS_DIR' ) ) {
    define( 'VGSE_USERS_DIR', __DIR__ );
}
require_once 'vendor/vg-plugin-sdk/index.php';
require_once 'vendor/freemius/start.php';
require_once 'inc/freemius-init.php';
require_once 'inc/helpers.php';
if ( beupis_fs()->can_use_premium_code() ) {
    if ( !defined( 'VGSE_USERS_IS_PREMIUM' ) ) {
        define( 'VGSE_USERS_IS_PREMIUM', true );
    }
}
if ( !class_exists( 'WP_Sheet_Editor_Users' ) ) {
    /**
     * Filter rows in the spreadsheet editor.
     */
    class WP_Sheet_Editor_Users {
        private static $instance = false;

        public $plugin_url = null;

        public $plugin_dir = null;

        public $textname = 'vg_sheet_editor_users';

        public $buy_link = null;

        public $version = '1.3.4';

        var $settings = null;

        public $args = null;

        var $vg_plugin_sdk = null;

        public $modules_controller = null;

        public $sheets_bootstrap = null;

        private function __construct() {
        }

        function init_plugin_sdk() {
            $this->args = array(
                'main_plugin_file'         => __FILE__,
                'show_welcome_page'        => true,
                'welcome_page_file'        => $this->plugin_dir . '/views/welcome-page-content.php',
                'upgrade_message_file'     => $this->plugin_dir . '/views/upgrade-message.php',
                'website'                  => 'https://wpsheeteditor.com',
                'logo_width'               => 180,
                'logo'                     => plugins_url( '/assets/imgs/logo.svg', __FILE__ ),
                'buy_link'                 => $this->buy_link,
                'plugin_name'              => 'Bulk Edit Users',
                'plugin_prefix'            => 'wpseu_',
                'show_whatsnew_page'       => true,
                'whatsnew_pages_directory' => $this->plugin_dir . '/views/whats-new/',
                'plugin_version'           => $this->version,
                'plugin_options'           => $this->settings,
            );
            $this->vg_plugin_sdk = new VG_Freemium_Plugin_SDK($this->args);
        }

        function notify_wrong_core_version() {
            $plugin_data = get_plugin_data( __FILE__, false, false );
            ?>
			<div class="notice notice-error">
				<p><?php 
            _e( 'Please update the WP Sheet Editor plugin and all its extensions to the latest version. The features of the plugin "' . $plugin_data['Name'] . '" will be disabled temporarily because it is the newest version and it conflicts with old versions of other WP Sheet Editor plugins. The features will be enabled automatically after you install the updates.', vgse_users()->textname );
            ?></p>
			</div>
			<?php 
        }

        function init() {
            require_once __DIR__ . '/modules/init.php';
            $this->modules_controller = new WP_Sheet_Editor_CORE_Modules_Init(__DIR__, beupis_fs());
            $this->plugin_url = plugins_url( '/', __FILE__ );
            $this->plugin_dir = __DIR__;
            $this->buy_link = beupis_fs()->checkout_url();
            $this->init_plugin_sdk();
            // After core has initialized
            add_action( 'vg_sheet_editor/initialized', array($this, 'after_core_init') );
            add_action( 'vg_sheet_editor/after_init', array($this, 'after_full_core_init') );
            add_action( 'admin_init', array($this, 'disable_free_plugins_when_premium_active'), 1 );
            add_action( 'vg_sheet_editor/editor/register_columns', array($this, 'register_columns') );
            if ( !is_admin() ) {
                // Fix. Required when loading the users spreadsheet on the frontend
                if ( !function_exists( 'get_editable_roles' ) ) {
                    require_once ABSPATH . '/wp-admin/includes/user.php';
                }
                if ( !function_exists( 'wp_dropdown_roles' ) ) {
                    require ABSPATH . 'wp-admin/includes/template.php';
                }
            }
            add_action( 'init', array($this, 'after_init') );
            add_action( 'before_woocommerce_init', function () {
                if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
                    $main_file = __FILE__;
                    $parent_dir = dirname( dirname( $main_file ) );
                    $new_path = str_replace( $parent_dir, '', $main_file );
                    $new_path = wp_normalize_path( ltrim( $new_path, '\\/' ) );
                    \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', $new_path, true );
                }
            } );
        }

        function after_init() {
            load_plugin_textdomain( $this->textname, false, basename( dirname( __FILE__ ) ) . '/lang/' );
        }

        function register_toolbar_items( $editor ) {
            if ( $editor->args['provider'] !== 'user' ) {
                return;
            }
            if ( !WP_Sheet_Editor_Helpers::current_user_can( 'install_plugins' ) ) {
                return;
            }
            $editor->args['toolbars']->register_item( 'wpse_license', array(
                'type'                  => 'button',
                'content'               => __( 'My license', vgse_users()->textname ),
                'url'                   => beupis_fs()->get_account_url(),
                'toolbar_key'           => 'secondary',
                'extra_html_attributes' => ' target="_blank" ',
                'allow_in_frontend'     => false,
                'fs_id'                 => beupis_fs()->get_id(),
            ), 'user' );
        }

        function register_columns( $editor ) {
            if ( $editor->provider->key !== 'user' || WP_Sheet_Editor_Helpers::current_user_can( 'edit_users' ) ) {
                return;
            }
            // Lock all columns if user can't edit other users
            $spreadsheet_columns = $editor->get_provider_items( $editor->provider->key );
            foreach ( $spreadsheet_columns as $key => $column ) {
                $editor->args['columns']->register_item(
                    $key,
                    $editor->provider->key,
                    array(
                        'column_width' => $column['column_width'] + 20,
                        'is_locked'    => true,
                    ),
                    true
                );
            }
        }

        function disable_free_plugins_when_premium_active() {
            $free_plugins_path = array('bulk-edit-user-profiles-in-spreadsheet/users.php', 'woo-customers-spreadsheet-bulk-edit/woocommerce-customers.php');
            if ( is_plugin_active( 'bulk-edit-user-profiles-in-spreadsheet-premium/users.php' ) ) {
                foreach ( $free_plugins_path as $relative_path ) {
                    $path = wp_normalize_path( WP_PLUGIN_DIR . '/' . $relative_path );
                    if ( is_plugin_active( $relative_path ) ) {
                        deactivate_plugins( plugin_basename( $path ) );
                    }
                }
            }
        }

        function after_core_init() {
            if ( version_compare( VGSE()->version, '2.24.22-beta.1' ) < 0 ) {
                add_action( 'admin_notices', array($this, 'notify_wrong_core_version') );
                return;
            }
            // Override core buy link with this plugin´s
            VGSE()->buy_link = $this->buy_link;
            add_filter( 'vg_sheet_editor/allowed_post_types', array($this, 'allow_users') );
            add_filter(
                'vg_sheet_editor/filters/allowed_fields',
                array($this, 'modify_filter_fields'),
                10,
                2
            );
            add_filter(
                'vg_sheet_editor/columns/blacklisted_columns',
                array($this, 'blacklist_private_columns'),
                10,
                2
            );
            add_filter(
                'vg_sheet_editor/api/all_post_types',
                array($this, 'append_users_to_post_types_list'),
                10,
                3
            );
            add_filter(
                'vg_sheet_editor/formulas/sql_execution/can_execute',
                array($this, 'disable_fast_formulas_on_delete'),
                10,
                4
            );
            add_filter( 'vg_sheet_editor/bootstrap/settings', array($this, 'disallow_users_on_post_types_sheets') );
            // Enable admin pages in case "frontend sheets" addon disabled them
            add_filter( 'vg_sheet_editor/register_admin_pages', '__return_true', 11 );
            add_filter(
                'vg_sheet_editor/load_rows/wp_query_args',
                array($this, 'filter_by_user_role'),
                10,
                2
            );
            add_action( 'vg_sheet_editor/editor/before_init', array($this, 'register_toolbar_items') );
            add_action( 'vg_sheet_editor/after_enqueue_assets', array($this, 'register_assets') );
            add_filter(
                'vg_sheet_editor/filters/sanitize_request_filters',
                array($this, 'register_custom_filters'),
                10,
                2
            );
        }

        /**
         * Register frontend assets
         */
        function register_assets() {
            wp_enqueue_script(
                'wp-sheet-editor-users-js',
                plugins_url( '/assets/js/init.js', __FILE__ ),
                array(),
                VGSE()->version,
                false
            );
        }

        function disallow_users_on_post_types_sheets( $bootstrap_settings ) {
            if ( $bootstrap_settings['is_generic_post_type_bootstrap'] && ($index = array_search( 'user', $bootstrap_settings['enabled_post_types'] )) ) {
                unset($bootstrap_settings['enabled_post_types'][$index]);
            }
            return $bootstrap_settings;
        }

        function disable_fast_formulas_on_delete(
            $allowed,
            $formula,
            $column,
            $post_type
        ) {
            if ( $post_type === 'user' && $column['key'] === 'wpse_status' ) {
                $allowed = false;
            }
            return $allowed;
        }

        function blacklist_private_columns( $blacklisted_fields, $provider ) {
            if ( $provider !== 'user' ) {
                return $blacklisted_fields;
            }
            $blacklisted_fields[] = '(_\\d+)?_capabilities';
            $blacklisted_fields[] = '_user_level$';
            $blacklisted_fields[] = 'meta-box-order_';
            $blacklisted_fields[] = '^dismissed_wp_pointers$';
            $blacklisted_fields[] = 'show_welcome_panel';
            $blacklisted_fields[] = 'session_tokens';
            $blacklisted_fields[] = '_user-settings';
            $blacklisted_fields[] = '_user-settings-time';
            $blacklisted_fields[] = 'community-events-location';
            $blacklisted_fields[] = '_dashboard_quick_press_last_post_id';
            $blacklisted_fields[] = 'source_domain';
            $blacklisted_fields[] = 'primary_blog';
            $blacklisted_fields[] = '_woocommerce_persistent_cart';
            $blacklisted_fields[] = '_r_tru_u_x';
            $blacklisted_fields[] = 'woocommerce_product_import_mapping';
            $blacklisted_fields[] = 'metaboxhidden_';
            $blacklisted_fields[] = 'last_update';
            $blacklisted_fields[] = '_product_import_error_log';
            $blacklisted_fields[] = 'tribe-dismiss-notice';
            $blacklisted_fields[] = 'closedpostboxes_';
            $blacklisted_fields[] = 'dismissed_wootenberg_notice';
            $blacklisted_fields[] = '_yoast_notifications';
            $blacklisted_fields[] = '_yoast_wpseo_profile_updated';
            $blacklisted_fields[] = 'bookmark_id';
            $blacklisted_fields[] = 'bpbm-last-seen-thread-';
            $blacklisted_fields[] = '^wpse_';
            $blacklisted_fields[] = '_wpse_';
            $blacklisted_fields[] = 'ignore_redux_blast_';
            $blacklisted_fields[] = '_wpf_member_obj';
            $blacklisted_fields[] = 'managetoplevel_page';
            $blacklisted_fields[] = 'nf_form_preview';
            $blacklisted_fields[] = '_sfwd-course_progress_';
            $blacklisted_fields[] = 'woocommerce_tracks_anon_id';
            $blacklisted_fields[] = 'vgse_column_sizes';
            $blacklisted_fields[] = 'bb_profile_long_slug';
            $blacklisted_fields[] = 'bb_profile_slug';
            $blacklisted_fields[] = 'course_time_\\d+';
            $blacklisted_fields[] = 'wpse_api_key';
            return $blacklisted_fields;
        }

        function append_users_to_post_types_list( $post_types, $args, $output ) {
            if ( $output === 'names' ) {
                $post_types['user'] = 'user';
            } else {
                $post_types['user'] = (object) array(
                    'label' => __( 'Users', $this->textname ),
                    'name'  => 'user',
                );
            }
            return $post_types;
        }

        function filter_by_user_role( $query_args, $data = array() ) {
            $query_args['role__in'] = array_keys( VGSE_Users_Helpers_Obj()->get_available_user_roles() );
            if ( !empty( VGSE()->options['users_hide_administrators'] ) ) {
                $query_args['role__not_in'] = array('administrator');
            }
            if ( !empty( VGSE()->options['users_allowed_roles'] ) ) {
                $query_args['role__in'] = array_map( 'trim', explode( ',', VGSE()->options['users_allowed_roles'] ) );
            }
            return $query_args;
        }

        function register_custom_filters( $sanitized_filters, $dirty_filters ) {
            if ( isset( $dirty_filters['role'] ) ) {
                $sanitized_filters['role'] = sanitize_text_field( $dirty_filters['role'] );
            }
            if ( !empty( $dirty_filters['email__in'] ) ) {
                $sanitized_filters['email__in'] = sanitize_textarea_field( $dirty_filters['email__in'] );
            }
            return $sanitized_filters;
        }

        function modify_filter_fields( $fields, $post_type ) {
            if ( $post_type === 'user' ) {
                $new_fields = array(
                    'keyword' => array(
                        'label'       => __( 'Search in user email, login, nicename, display name', $this->textname ),
                        'description' => 'If you want to search by first name or last name, use the *advanced filters* option.',
                    ),
                );
                $fields = $new_fields;
            }
            return $fields;
        }

        function after_full_core_init() {
            // Don't load plugin if user can't list users.
            if ( !WP_Sheet_Editor_Helpers::current_user_can( 'edit_users' ) ) {
                return;
            }
            // Set up spreadsheet.
            // Allow to bootstrap editor manually, later.
            if ( !apply_filters( 'vg_sheet_editor/users/bootstrap/manual_init', false ) ) {
                $this->sheets_bootstrap = new WPSE_Users_Spreadsheet_Bootstrap(array(
                    'enabled_post_types'             => array('user'),
                    'register_toolbars'              => true,
                    'register_columns'               => true,
                    'register_taxonomy_columns'      => false,
                    'register_admin_menus'           => true,
                    'register_spreadsheet_editor'    => true,
                    'current_provider'               => 'user',
                    'is_generic_post_type_bootstrap' => false,
                ));
            }
            add_action(
                'vg_sheet_editor/editor_page/after_console_text',
                array($this, 'notify_free_limitations_above_table'),
                30,
                1
            );
            add_filter(
                'send_email_change_email',
                array($this, 'dont_notify_email_change_for_temp_email'),
                10,
                3
            );
        }

        function dont_notify_email_change_for_temp_email( $allowed, $user, $userdata ) {
            if ( strpos( $user['user_email'], 'temporary-remove' ) === 0 ) {
                $allowed = false;
            }
            return $allowed;
        }

        function notify_free_limitations_above_table( $post_type ) {
            if ( $post_type !== 'user' ) {
                return;
            }
            echo '<span class="wpse-lite-version-message">';
            printf( __( '. <b>Lite version</b> listing "subscriber" users. <b>Go pro:</b> edit all the roles (%s), custom fields, export, import, and more', 'vg_sheet_editor' ), esc_html( str_replace( ', Subscriber', '', implode( ', ', VGSE_Users_Helpers_Obj()->get_all_the_roles() ) ) ) );
            echo '</span>';
        }

        function allow_users( $post_types ) {
            $post_types['user'] = __( 'Users', $this->textname );
            return $post_types;
        }

        /**
         * Creates or returns an instance of this class.
         */
        static function get_instance() {
            if ( null == self::$instance ) {
                self::$instance = new WP_Sheet_Editor_Users();
                self::$instance->init();
            }
            return self::$instance;
        }

        function __set( $name, $value ) {
            $this->{$name} = $value;
        }

        function __get( $name ) {
            return $this->{$name};
        }

    }

}
if ( !function_exists( 'vgse_users' ) ) {
    function vgse_users() {
        return WP_Sheet_Editor_Users::get_instance();
    }

    vgse_users();
}