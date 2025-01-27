<?php

defined( 'ABSPATH' ) || exit;
if ( !class_exists( 'WPSE_Users_Sheet' ) ) {
    class WPSE_Users_Sheet extends WPSE_Sheet_Factory {
        public $key = 'user';

        function __construct() {
            $allowed_columns = array();
            $allowed_columns = array();
            parent::__construct( array(
                'fs_object'                         => beupis_fs(),
                'post_type'                         => array($this->key),
                'post_type_label'                   => array(__( 'Users' )),
                'serialized_columns'                => array(),
                'register_default_taxonomy_columns' => false,
                'bootstrap_class'                   => 'WPSE_Users_Spreadsheet_Bootstrap',
                'columns'                           => array($this, 'get_columns'),
                'allowed_columns'                   => $allowed_columns,
                'remove_columns'                    => array(),
            ) );
            add_action( 'vg_sheet_editor/editor/register_columns', array($this, 'lock_columns_if_cant_edit_users'), 90 );
            add_action(
                'vg_sheet_editor/editor_page/after_console_text',
                array($this, 'notify_free_limitations_above_table'),
                30,
                1
            );
            add_filter(
                'vg_sheet_editor/filters/allowed_fields',
                array($this, 'modify_filter_fields'),
                10,
                2
            );
            add_filter(
                'send_email_change_email',
                array($this, 'dont_notify_email_change_for_temp_email'),
                10,
                2
            );
            add_filter( 'vg_sheet_editor/load_rows/wp_query_args', array($this, 'filter_by_user_role') );
            add_filter(
                'vg_sheet_editor/filters/sanitize_request_filters',
                array($this, 'register_custom_filters'),
                10,
                2
            );
            add_filter(
                'vg_sheet_editor/columns/blacklisted_columns',
                array($this, 'blacklist_private_columns'),
                10,
                2
            );
        }

        function filter_by_user_role( $query_args ) {
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

        function blacklist_private_columns( $blacklisted_fields, $provider ) {
            if ( $provider !== $this->key ) {
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

        function modify_filter_fields( $fields, $post_type ) {
            if ( $post_type === $this->key ) {
                $new_fields = array(
                    'keyword' => array(
                        'label'       => __( 'Search in user email, login, nicename, display name', 'vg_sheet_editor_users' ),
                        'description' => 'If you want to search by first name or last name, use the *advanced filters* option.',
                    ),
                );
                $fields = $new_fields;
            }
            return $fields;
        }

        function dont_notify_email_change_for_temp_email( $allowed, $user ) {
            if ( strpos( $user['user_email'], 'temporary-remove' ) === 0 ) {
                $allowed = false;
            }
            return $allowed;
        }

        function notify_free_limitations_above_table( $post_type ) {
            if ( $post_type !== $this->key ) {
                return;
            }
            echo '<span class="wpse-lite-version-message">';
            printf( __( '. <b>Lite version</b> listing "subscriber" users. <b>Go pro:</b> edit all the roles (%s), custom fields, export, import, and more', 'vg_sheet_editor' ), esc_html( str_replace( ', Subscriber', '', implode( ', ', VGSE_Users_Helpers_Obj()->get_all_the_roles() ) ) ) );
            echo '</span>';
        }

        function lock_columns_if_cant_edit_users( $editor ) {
            if ( $editor->provider->key !== $this->key || WP_Sheet_Editor_Helpers::current_user_can( 'edit_users' ) ) {
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

        function get_columns() {
        }

    }

    $GLOBALS['wpse_users_sheet'] = new WPSE_Users_Sheet();
}