<?php defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WPSE_Custom_Tables_Serialized_Fields' ) ) {

	class WPSE_Custom_Tables_Serialized_Fields extends WP_Sheet_Editor_Infinite_Serialized_Field {

		function __construct( $settings = array() ) {
			if ( ! empty( VGSE()->options['be_disable_serialized_columns'] ) || ! apply_filters( 'vg_sheet_editor/serialized_addon/is_enabled', true ) ) {
				return;
			}
			$defaults       = array(
				'prefix'                         => 'seis_',
				'column_settings'                => array(),
				'allow_in_wc_product_variations' => false,
			);
			$this->settings = apply_filters( 'vg_sheet_editor/infinite_serialized_column/settings', wp_parse_args( $settings, $defaults ) );

			$this->settings['prefix'] = $this->settings['sample_field_key'] . '_';
			$this->column_keys        = array_keys( $this->get_column_keys() );

			// Priority 20 to allow to instantiate from another editor/before_init function
			add_action( 'vg_sheet_editor/editor/register_columns', array( $this, 'register_columns' ), 20 );
		}

		function get_existing_value( $post_id, $key ) {
			global $wpdb;
			$provider  = VGSE()->helpers->get_current_provider();
			$post_type = $provider->get_sheet_key();
			$id_column = $provider->get_post_data_table_id_key( $post_type );
			$raw_value = $wpdb->get_var( $wpdb->prepare( 'SELECT %i FROM %i WHERE %i = %d', $key, $post_type, $id_column, $post_id ) );
			$data      = $raw_value && is_serialized( $raw_value ) ? maybe_unserialize( $raw_value ) : array();
			if ( ! is_array( $data ) ) {
				$data = array();
			}
			return apply_filters( 'vg_sheet_editor/infinite_serialized_column/existing_value', $data, $post_id, $key );
		}

		function update_value( $post_id, $key, $value ) {
			global $wpdb;
			$value = apply_filters( 'vg_sheet_editor/infinite_serialized_column/update_value', $value, $post_id, $key );

			// Make sure that we don't save empty rows
			if ( is_array( $value ) ) {
				$first_value = current( $value );
				if ( is_array( $first_value ) ) {
					foreach ( $value as $index => $single_value ) {
						if ( ! is_array( $single_value ) ) {
							continue;
						}
						$filtered_value = array_filter( $single_value );
						if ( empty( $filtered_value ) ) {
							unset( $value[ $index ] );
						}
					}
				}
			}
			$provider  = VGSE()->helpers->get_current_provider();
			$post_type = $provider->get_sheet_key();
			$id_column = $provider->get_post_data_table_id_key( $post_type );
			$wpdb->update(
				$post_type,
				array(
					$key => maybe_serialize( $value ),
				),
				array(
					$id_column => $post_id,
				)
			);
		}

	}

}
