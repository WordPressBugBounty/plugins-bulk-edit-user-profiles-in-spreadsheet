<?php
/**
 * Template used for the spreadsheet editor page in all post types.
 */
defined( 'ABSPATH' ) || exit;
global $wpdb;
$nonce = wp_create_nonce( 'bep-nonce' );

if ( empty( $current_post_type ) ) {
	$current_post_type = VGSE()->helpers->get_provider_from_query_string();
}
$editor = VGSE()->helpers->get_provider_editor( $current_post_type );
if ( ! $editor ) {
	return;
}
$editor_settings = $editor->get_editor_settings( $current_post_type );

if ( function_exists( 'WPSE_Profiler_Obj' ) ) {
	WPSE_Profiler_Obj()->record( 'Start ' . __FUNCTION__ );
}
if ( ! empty( $_GET['wpse_load_rows_main_page'] ) && VGSE_DEBUG && VGSE()->helpers->user_can_manage_options() ) {
	if ( ! defined( 'WPSE_PROFILE' ) && ! empty( $_GET['wpse_profile'] ) ) {
		define( 'WPSE_PROFILE', true );
	}
	$rows = VGSE()->helpers->get_rows(
		array(
			'nonce'       => $nonce,
			'post_type'   => $current_post_type,
			'filters'     => '',
			'wpse_source' => 'load_rows',
		)
	);
	return;
}

$subtle_lock = in_array( gmdate( 'Y-m-d' ), array( '2019-10-22', '2019-10-24', '2019-10-30' ) ) ? true : false;
?>
<style>
	/*Hide all the wp-admin notices on the spreadsheet page to make it look cleaner*/
	/*We place the css here so it loads on the spreadsheet page regardless of the placement (wp-admin or frontend)*/
	.wp-core-ui .notice:not(.wpse-notice).is-dismissible, 
	.wp-core-ui .notice:not(.wpse-notice), 
	.woocommerce-message,
	.notice:not(.wpse-notice), 
	div.error:not(.wpse-notice), 
	div.updated:not(.wpse-notice) {
		display: none !important;
	}	
	/*Fix misaligned rows when they set custom image preview heights*/
	/* Disabled because it was initially added as the fixed columns were misaligned when rows had content taller than the regular row height and this CSS forced all the rows to have the same height. But this is no longer necessary since we fixed the misalignment issue in our CSS and now rows can have dynamic height without misalignment. */
	<?php if ( ! empty( $editor_settings['media_cell_preview_max_height'] ) ) { ?>
	/*#vgse-wrapper :not(.htContextMenu) .ht_master.handsontable tbody th, 
	#vgse-wrapper .ht_clone_left tbody td,
	#vgse-wrapper .ht_clone_left tbody th,
	#vgse-wrapper .ht_master.handsontable tbody td:not(.htSeparator) {
		height: <?php echo (int) $editor_settings['media_cell_preview_max_height']; ?>px !important;
	}*/
	<?php } ?>
</style>
<div class="remodal-bg highlightCurrentRow 
<?php
if ( $subtle_lock ) {
	echo 'vgse-subtle-lock';}
?>
" id="vgse-wrapper" data-nonce="<?php echo esc_attr( $nonce ); ?>">
	<div class="">
		<div class="sheet-header">
<?php
if ( function_exists( 'WPSE_Profiler_Obj' ) ) {
	WPSE_Profiler_Obj()->record( 'Before logo ' . __FUNCTION__ );
}
?>
			<!--Primary toolbar placeholder, used to keep its height when the toolbar is fixed when scrolling-->
			<div id="vg-header-toolbar-placeholder" class="vg-toolbar-placeholder"></div>
			<div id="vg-header-toolbar" class="vg-toolbar js-sticky-top">
				<?php if ( apply_filters( 'vg_sheet_editor/editor_page/allow_display_logo', true, $current_post_type ) ) { ?>
					<div class="sheet-logo-wrapper">
						<h2 class="hidden"><?php esc_html_e( 'Sheet Editor', 'vg_sheet_editor' ); ?></h2>
						<a href="https://wpsheeteditor.com/?utm_source=wp-admin&utm_medium=editor-logo&utm_campaign=<?php echo esc_attr( $current_post_type ); ?>" target="_blank" class="logo-link"><img src="<?php echo esc_url( VGSE()->logo_url ); ?>" class="vg-logo"></a>

						<?php
						if ( is_admin() && apply_filters( 'vg_sheet_editor/editor_page/full_screen_mode_active', true ) ) {
							$is_active = empty( VGSE()->options['be_disable_full_screen_mode_on'] );
							?>
							<div class="wpse-full-screen-notice" data-status="<?php echo (int) ! $is_active; ?>">
								<div class="wpse-full-screen-notice-content notice-on">
									<?php esc_html_e( 'Full screen mode is active', 'vg_sheet_editor' ); ?> 
									<a href="#" class="wpse-full-screen-toggle wpse-set-settings" data-silent-action="1" data-name="be_disable_full_screen_mode_on" data-value="1"><?php esc_html_e( 'Exit', 'vg_sheet_editor' ); ?></a> 
								</div>

								<div class="wpse-full-screen-notice-content notice-off">
									<a href="#" class="wpse-full-screen-toggle wpse-set-settings" data-silent-action="1" data-name="be_disable_full_screen_mode_on" data-value=""><?php esc_html_e( 'Activate full screen', 'vg_sheet_editor' ); ?></a>
								</div>
							</div>
						<?php } ?>
						<?php do_action( 'vg_sheet_editor/editor_page/after_logo', $current_post_type ); ?>
					</div>
				<?php } ?>
				<?php do_action( 'vg_sheet_editor/editor_page/before_toolbars', $current_post_type ); ?>

				<?php
				if ( function_exists( 'WPSE_Profiler_Obj' ) ) {
					WPSE_Profiler_Obj()->record( 'Before secondary toolbar ' . __FUNCTION__ );
				}
				?>
				<?php
				$secondary_toolbar_items_html = ( $editor->args['toolbars'] ) ? $editor->args['toolbars']->get_rendered_provider_items( $current_post_type, 'secondary' ) : '';
				if ( $secondary_toolbar_items_html ) {
					?>
					<!--Secondary toolbar-->
					<div class="vg-secondary-toolbar">
						<div class="vg-header-toolbar-inner">

							<?php
							 // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							echo $secondary_toolbar_items_html; // WPCS: XSS ok.
							do_action( 'vg_sheet_editor/toolbar/after_buttons', $current_post_type, 'secondary' );
							?>

							<div class="clear"></div>
						</div>
						<div class="clear"></div>
					</div>
				<?php } ?>
				
<?php
if ( function_exists( 'WPSE_Profiler_Obj' ) ) {
	WPSE_Profiler_Obj()->record( 'Before primary toolbar ' . __FUNCTION__ );
}
?>

				<!--Primary toolbar-->
				<div class="vg-header-toolbar-inner">

					<?php
					if ( $editor->args['toolbars'] ) {
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						echo $editor->args['toolbars']->get_rendered_provider_items( $current_post_type, 'primary' ); // WPCS: XSS ok.
					}
					do_action( 'vg_sheet_editor/toolbar/after_buttons', $current_post_type, 'primary' );
					?>

					<div class="clear"></div>
				</div>
				
<?php
if ( function_exists( 'WPSE_Profiler_Obj' ) ) {
	WPSE_Profiler_Obj()->record( 'Before console ' . __FUNCTION__ );
}
?>
				<div id="responseConsole" class="console">
					<?php
					$console_items = array(
						'be-current-sheet' => array(
							'label' => esc_html__( 'Current spreadsheet', 'vg_sheet_editor' ),
							'value' => VGSE()->helpers->get_post_type_label( $current_post_type ),
						),
						'be-total-rows'    => array(
							'label' => esc_html__( 'Rows', 'vg_sheet_editor' ),
							'value' => 0,
						),
					);
					if ( ! empty( VGSE()->options[ 'default_sortby_' . $current_post_type ] ) ) {
						$custom_order_by                 = preg_replace( '/^(ASC|DESC):/', '', VGSE()->options[ 'default_sortby_' . $current_post_type ] );
						$custom_order                    = strpos( VGSE()->options[ 'default_sortby_' . $current_post_type ], 'ASC:' ) === 0 ? 'ASC' : 'DESC';
						$spreadsheet_columns             = VGSE()->helpers->get_provider_columns( $current_post_type );
						$sort_name                       = isset( $spreadsheet_columns[ $custom_order_by ] ) ? $spreadsheet_columns[ $custom_order_by ]['title'] : $custom_order_by;
						$console_items['be-global-sort'] = array(
							'label' => esc_html__( 'Global sort', 'vg_sheet_editor' ),
							'value' => $sort_name . ' (' . $custom_order . ')',
						);
					}
					$console_items = apply_filters(
						'vg_sheet_editor/editor_page/console_items',
						$console_items,
						$current_post_type
					);
					foreach ( $console_items as $key => $item ) {
						?>
<span class="<?php echo sanitize_html_class( $key ); ?>"><b><?php echo esc_html( $item['label'] ); ?>:</b> <span class="item-value"><?php echo wp_kses_post( $item['value'] ); ?></span></span>. 
						<?php
					}
					?>
					<?php
					do_action( 'vg_sheet_editor/editor_page/after_console_text', $current_post_type );

					$post_type_taxonomies = get_object_taxonomies( $current_post_type );
					if ( post_type_exists( $current_post_type ) && $post_type_taxonomies ) {
						$term_separator = VGSE()->helpers->get_term_separator();
						$transient_key  = 'vgse_term_separator_c_' . md5( $term_separator );
						$term_count     = get_transient( $transient_key );
						if ( method_exists( VGSE()->helpers, 'can_rescan_db_fields' ) && VGSE()->helpers->can_rescan_db_fields( $current_post_type ) ) {
							$term_count = false;
						}
						if ( false === $term_count ) {
							$query = $wpdb->prepare(
								"SELECT COUNT(*) 
									FROM $wpdb->terms t 
									INNER JOIN $wpdb->term_taxonomy tt ON t.term_id = tt.term_id
									WHERE t.name LIKE %s
									AND tt.taxonomy IN (" . implode( ',', array_fill( 0, count( $post_type_taxonomies ), '%s' ) ) . ')',
								array_merge(
									array( '%' . $wpdb->esc_like( $term_separator ) . '%' ),
									$post_type_taxonomies
								)
							);

							$term_count = (int) $wpdb->get_var( $query );
							set_transient( $transient_key, $term_count, DAY_IN_SECONDS );
						}

						if ( $term_count ) {
							echo '<span class="notice-text" style="color: red;">';
							// translators: 1: term separator
							echo sprintf( esc_html__( 'Warning: You are using a conflicting taxonomy term separator (%s).', 'vg_sheet_editor' ), $term_separator );
							echo ' <a href="https://wpsheeteditor.com/fix-taxonomy-term-separator-warning/" target="_blank">' . esc_html__( 'Learn more', 'vg_sheet_editor' ) . '</a>';
							echo '</span>';
						}
					}
					// WP memory limit.
					$wp_memory_limit = VGSE()->helpers->let_to_num( WP_MEMORY_LIMIT );
					if ( function_exists( 'memory_get_usage' ) ) {
						$wp_memory_limit = max( $wp_memory_limit, VGSE()->helpers->let_to_num( @ini_get( 'memory_limit' ) ) );
					}
					if ( $wp_memory_limit > 0 && $wp_memory_limit < 256000000 ) {
						echo '<span class="notice-text" style="color: red;">' . esc_html__( '. We recommend you increase the server memory to at least 256mb to prevent server errors.', 'vg_sheet_editor' ) . '<a href="https://docs.woocommerce.com/document/increasing-the-wordpress-memory-limit/" target="_blank">' . esc_html__( 'Tutorial', 'vg_sheet_editor' ) . '</a></span>';
					}
					?>
				</div>
				<div class="vgse-current-filters" x-data="vgseCurrentFilters" x-show="hasFilters" x-cloak style="display: none;">
					<?php esc_html_e('Active filters:', 'vg_sheet_editor'); ?>
					<template x-if="filters.activeFilters">
						<i class="fa fa-copy" style="cursor: pointer; margin-right: 10px" title="<?php esc_html_e( 'Copy a URL of the spreadsheet with the active filters applied, URL valid for your current WordPress session', 'vg_sheet_editor' ); ?>"  aria-hidden="true" @click.prevent="copyFiltersUrl"></i>
					</template>
					<template x-for="(value, key) in filters.activeFilters">
						<template x-if="key !== 'meta_query' && value && (Array.isArray(value) ? value.length : true)">
							<a href="#" class="button" @click.prevent="filters.removeFilter(key, null, true)">
								<i class="fa fa-remove"></i>
								<span x-text="filters.getFilterLabel(key)"></span>:
								<span x-text="Array.isArray(value) ? value.join(', ') : String(value).substring(0, 20) + (String(value).length > 20 ? '...' : '')"></span>
							</a>
						</template>
					</template>
					<template x-if="filters.activeFilters.meta_query && filters.activeFilters.meta_query.length">
						<template x-for="(filter, index) in filters.activeFilters.meta_query">
							<template x-if="filter && filter.key">
								<a href="#" class="button advanced-filter" @click.prevent="filters.removeFilter(null, index, true)">
									<i class="fa fa-remove"></i>
									<span x-text="filters.getMetaFilterLabel(filter)"></span>
								</a>
							</template>
						</template>
					</template>
					<template x-if="hasMultipleFilters">
						<a href="#" class="button advanced-filter remove-all-filters" @click.prevent="filters.removeAll(true, true)">
							<i class="fa fa-remove"></i> <?php esc_html_e('Remove all filters', 'vg_sheet_editor'); ?>
						</a>
					</template>
				</div>				
			</div>

		</div>
		<div>

			<?php do_action( 'vg_sheet_editor/editor_page/before_spreadsheet', $current_post_type ); ?>

			<?php
			if ( ! empty( VGSE()->options['be_disable_automatic_loading_rows'] ) ) {
				?>
				<div class="automatic-loading-rows-disabled">
					<h3><?php esc_html_e( 'Welcome to WP Sheet Editor', 'vg_sheet_editor' ); ?></h3>
					<p><?php esc_html_e( 'Please make a search to load the rows and start editing (use the "search" option in the top toolbar).', 'vg_sheet_editor' ); ?></p>
					<?php if ( VGSE()->helpers->user_can_manage_options() ) { ?>
						<p><small>
						<?php
						esc_html_e( 'You need to load the rows manually because you deactivated the automatic loading of rows.', 'vg_sheet_editor' );
						echo ' <a href="#" data-remodal-target="modal-advanced-settings">';
						esc_html_e( 'Change the settings', 'vg_sheet_editor' );
						echo '</a>';
						?>
						</small></p>
					<?php } ?>
				</div>
				<?php
			}
			?>
			<?php
			if ( function_exists( 'WPSE_Profiler_Obj' ) ) {
				WPSE_Profiler_Obj()->record( 'Before data ' . __FUNCTION__ );
			}
			?>
			<!--Spreadsheet container-->
			<div id="post-data" data-post-type="<?php echo esc_attr( $current_post_type ); ?>" class="be-spreadsheet-wrapper"></div>

			<div id="mas-data"></div>

			<?php
			if ( function_exists( 'WPSE_Profiler_Obj' ) ) {
				WPSE_Profiler_Obj()->record( 'Before footer ' . __FUNCTION__ );
			}
			?>
			<!--Footer toolbar-->
			<div id="vg-footer-toolbar" class="vg-toolbar js-sticky">
				<?php
				if ( ! empty( VGSE()->options['enable_pagination'] ) ) {
					?>
					<div class="pagination-links"></div>
					<div class="pagination-jump"><?php esc_html_e( 'Go to page', 'vg_sheet_editor' ); ?> <input type="number" min="1"></div>
					<?php if ( VGSE()->helpers->user_can_manage_options() && is_admin() ) { ?>
						<a class="change-pagination-style wpse-set-settings" href="#" data-reload-after-success="1" data-name="enable_pagination" data-value=""><?php esc_html_e( 'Use an infinite list instead of pagination', 'vg_sheet_editor' ); ?></a> <a data-wpse-tooltip="right" aria-label="<?php esc_html_e( 'Activate this option to remove the pagination buttons and load rows automatically when you scroll down. You will see all the rows at the same time, you can load thousands of rows without problems.', 'vg_sheet_editor' ); ?>" href="#">(?)</a>
					<?php } ?>
				<?php } else { ?>
					<button class="load-more button"><i class="fa fa-chevron-down"></i> <?php esc_html_e( 'Load More Rows', 'vg_sheet_editor' ); ?></button>  
					<button id="go-top" class="button"><i class="fa fa-chevron-up"></i> <?php esc_html_e( 'Go to the top', 'vg_sheet_editor' ); ?></button>		
					<?php if ( VGSE()->helpers->user_can_manage_options() && is_admin() ) { ?>
						<a class="change-pagination-style wpse-set-settings" href="#" data-reload-after-success="1" data-name="enable_pagination" data-value="1"><?php esc_html_e( 'Enable pagination', 'vg_sheet_editor' ); ?></a> <a data-wpse-tooltip="right" aria-label="<?php esc_html_e( 'By default we use an infinite list of rows and we load more rows every time you scroll down. You can activate this option to display pagination links and disable the infinite list', 'vg_sheet_editor' ); ?>" href="#">(?)</a>
					<?php } ?>
				<?php } ?>
				<?php if ( VGSE()->helpers->user_can_manage_options() && is_admin() ) { ?>
					<a class="increase-rows-per-page" href="<?php echo esc_url( VGSE()->helpers->get_settings_page_url() ); ?>" target="_blank"><?php esc_html_e( 'Increase rows per page', 'vg_sheet_editor' ); ?></a> <a data-wpse-tooltip="right" aria-label="<?php esc_html_e( 'We use pagination. By default we load 20 rows per page (every time you scroll down). You can increase the number to load more rows every time you scroll down.', 'vg_sheet_editor' ); ?>" href="#">(?)</a>
				<?php } ?>
				<?php do_action( 'vg_sheet_editor/editor_page/after_footer_actions', $current_post_type ); ?>
			</div>
		</div>

		<br>

	</div>

	<?php
	if ( function_exists( 'WPSE_Profiler_Obj' ) ) {
		WPSE_Profiler_Obj()->record( 'Before modals ' . __FUNCTION__ );
	}
	?>
	<div class="remodal confirm-bulk-delete-rows-modal" data-remodal-id="confirm-bulk-delete-rows-modal" data-remodal-options="closeOnOutsideClick: false, hashTracking: false">

		<div class="modal-content">
			<h3><?php esc_html_e( 'Delete rows', 'vg_sheet_editor' ); ?></h3>
			<p class="contains-variable">
			<?php
			/* translators: %s is the number of rows selected for deletion */
			printf( esc_html__( 'You selected %s rows to be deleted completely.', 'vg_sheet_editor' ), '<span>0</span>' );
			?>
			</p>
			<?php do_action( 'vg_sheet_editor/editor_page/confirm_bulk_delete_rows_modal/before_fields', $current_post_type ); ?>
			<p><?php esc_html_e( 'This will delete the rows from your database completely and the only way to undo this change is to restore a backup. Please make a backup in case you might need to undo this later.', 'vg_sheet_editor' ); ?></p>
			<p><?php esc_html_e( 'Please type the word DELETE and press enter to proceed:', 'vg_sheet_editor' ); ?> <input type="text" name="confirm_bulk_delete_rows"></p>
			<?php do_action( 'vg_sheet_editor/editor_page/confirm_bulk_delete_rows_modal/after_fields', $current_post_type ); ?>
		</div>
		<br>
		<button data-remodal-action="confirm" class="remodal-cancel"><?php esc_html_e( 'Cancel', 'vg_sheet_editor' ); ?></button>
	</div>

	<!--Image cells modal-->
	<div class="remodal" data-remodal-id="image" data-remodal-options="closeOnOutsideClick: false">

		<div class="modal-content">

		</div>
		<br>
		<button data-remodal-action="confirm" class="remodal-confirm"><?php esc_html_e( 'OK', 'vg_sheet_editor' ); ?></button>
	</div>

	<!--handsontable cells modal-->
	<div class="remodal remodal8982 custom-modal-editor" data-remodal-id="custom-modal-editor" data-remodal-options="closeOnOutsideClick: false, hashTracking: false" style="max-width: 825px;">

		<div class="modal-content">
			<p class="custom-attributes-edit">
			<h3 class="modal-title-wrapper">
				<span class="modal-general-title"></span> 
			</h3>
			<p class="modal-description"></p>
			<button data-delay="500" class="remodal-mover anterior remodal-secundario save-changes-handsontable"  data-wpse-tooltip="left" aria-label="<?php esc_html_e( 'Save changes and edit the previous row', 'vg_sheet_editor' ); ?>"><i class="fa fa-chevron-left"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-save"></i></button>
			<button class="remodal-confirm save-changes-handsontable"><?php esc_html_e( 'Save changes', 'vg_sheet_editor' ); ?></button>
			<button data-remodal-action="confirm" class="remodal-cancel"><?php esc_html_e( 'Close', 'vg_sheet_editor' ); ?></button>
			<button data-delay="500" class="siguiente remodal-secundario save-changes-handsontable" data-wpse-tooltip="right" aria-label="<?php esc_html_e( 'Save changes and edit the next row', 'vg_sheet_editor' ); ?>"><i class="fa fa-save"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-chevron-right"></i></button>

			<div class="handsontable-in-modal" id="handsontable-in-modal"></div>
			<?php require 'editor-metabox-modal.php'; ?>

			<input type="hidden" value="<?php echo esc_attr( $nonce ); ?>" name="nonce">
			<input type="hidden" value="" name="handsontable_modal_action">
			<input type="hidden" value="<?php echo esc_attr( $current_post_type ); ?>" name="post_type">
		</div>
	</div>

	<!--Tinymce editor modal-->
	<div class="remodal remodal2 modal-tinymce-editor" data-remodal-id="editor" data-remodal-options="hashTracking: false, closeOnOutsideClick: false">

		<div class="modal-content">
			<h3 class="post-title-modal"><?php esc_html_e( 'Editing:', 'vg_sheet_editor' ); ?> <span class="post-title"></span></h3>
			<?php do_action( 'vg_sheet_editor/editor_page/tinymce/before_editor', $current_post_type ); ?>
			<?php
			wp_enqueue_editor();

			// This is required to make WP render the tinyMCEPreInit variable with all the tinymce settings that we can use in the JS initialization
			_WP_Editors::editor_settings( 'editpost', _WP_Editors::parse_settings( 'editpost', array() ) );
			?>
			<textarea id="editpost" rows="30"></textarea>
			<span class="vgse-resize-editor-indicator vgse-tinymce-popup-indicators"><?php esc_html_e( 'You can resize the editor', 'vg_sheet_editor' ); ?> <i class="fa fa-arrow-up"></i></span>
		</div>
		<br>
		<?php do_action( 'vg_sheet_editor/editor_page/tinymce/before_action_buttons' ); ?>
		<button class="remodal-mover anterior remodal-secundario"><i class="fa fa-chevron-left"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-save"></i></button><a href="#" data-wpse-tooltip="left" aria-label="<?php esc_html_e( 'Save changes and edit the previous row', 'vg_sheet_editor' ); ?>">( ? )</a>
		<button class="remodal-confirm guardar-popup-tinymce" data-remodal-action="confirm"><i class="fa fa-save"></i></button><a href="#" data-wpse-tooltip="down" aria-label="<?php esc_html_e( 'Just save changes', 'vg_sheet_editor' ); ?>">( ? )</a>
		<?php do_action( 'vg_sheet_editor/editor_page/tinymce/between_action_buttons' ); ?>
		<button data-remodal-action="confirm" class="remodal-cancel"><i class="fa fa-close"></i></button><a href="#" data-wpse-tooltip="down" aria-label="<?php esc_html_e( 'Cancel the changes and close popup', 'vg_sheet_editor' ); ?>">( ? )</a>
		<button class="siguiente remodal-secundario"><i class="fa fa-save"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-chevron-right"></i></button><a href="#" data-wpse-tooltip="right" aria-label="<?php esc_html_e( 'Save changes and edit the next row', 'vg_sheet_editor' ); ?>">( ? )</a>
		<?php do_action( 'vg_sheet_editor/editor_page/tinymce/after_action_buttons' ); ?>
	</div>
<?php
if ( function_exists( 'WPSE_Profiler_Obj' ) ) {
	WPSE_Profiler_Obj()->record( 'Before save changes modal ' . __FUNCTION__ );
}
?>

	<!--Save changes modal-->
	<div class="remodal remodal5 bulk-save" data-remodal-id="bulk-save" data-remodal-options="closeOnOutsideClick: false, hashTracking: false">

		<div class="modal-content">
			<h2><?php esc_html_e( 'Save changes', 'vg_sheet_editor' ); ?></h2>

			<?php 
			do_action( 'vg_sheet_editor/editor_page/save_rows_modal/before_fields', $current_post_type );
			?>

			<!--Warning state-->
			<div class="be-saving-warning">
				<?php 
				do_action( 'vg_sheet_editor/editor_page/save_rows_modal/before_warning', $current_post_type );
				?>
				<?php if ( is_admin() && VGSE()->helpers->user_can_manage_options() ) { ?>
					<p><?php esc_html_e( 'The changes about to be made are not reversible. You should backup your database before proceding.', 'vg_sheet_editor' ); ?></p>
				<?php } else { ?>
					<p><?php esc_html_e( 'The changes about to be made are not reversible', 'vg_sheet_editor' ); ?></p>
				<?php } ?>
				<button class="be-start-saving remodal-confirm primary"><?php esc_html_e( 'I understand, continue', 'vg_sheet_editor' ); ?></button> <a href="#" class="remodal-cancel"><?php esc_html_e( 'Close', 'vg_sheet_editor' ); ?></a>
			</div>

			<!--Start saving state-->
			<div class="bulk-saving-screen">
				<p class="saving-now-message"><?php esc_html_e( 'We are saving now. Don\'t close this window until the process has finished.', 'vg_sheet_editor' ); ?></p>
				<?php if ( is_admin() && VGSE()->helpers->user_can_manage_options() ) { ?>
					<p class="tip-saving-speed-message"><b><?php esc_html_e( 'Tip:', 'vg_sheet_editor' ); ?></b> 
					<?php esc_html_e( 'The saving is too slow?', 'vg_sheet_editor' ); ?>
					<a href="<?php echo esc_url( VGSE()->helpers->get_settings_page_url() ); ?>" target="_blank"><?php esc_html_e( 'Save more posts per batch', 'vg_sheet_editor' ); ?></a><br> 
					<?php esc_html_e( 'Are you getting errors when saving?', 'vg_sheet_editor' ); ?>
					<a href="<?php echo esc_url( VGSE()->helpers->get_settings_page_url() ); ?>" target="_blank"><?php esc_html_e( 'Save less posts per batch', 'vg_sheet_editor' ); ?></a>
				</p>
				<?php } ?>
				<div id="be-nanobar-container"></div>

				<div class="response"></div>

				<!--Loading animation-->
				<div class="be-loading-anim">
					<div class="fountainG_1 fountainG"></div>
					<div class="fountainG_2 fountainG"></div>
					<div class="fountainG_3 fountainG"></div>
					<div class="fountainG_4 fountainG"></div>
					<div class="fountainG_5 fountainG"></div>
					<div class="fountainG_6 fountainG"></div>
					<div class="fountainG_7 fountainG"></div>
					<div class="fountainG_8 fountainG"></div>
				</div>
				<a href="#"  class="remodal-cancel hidden"><?php esc_html_e( 'Close', 'vg_sheet_editor' ); ?></a>
			</div>


		</div>
		<br>
	</div>
	<!--Used for featured image previews-->
	<div class="vi-preview-wrapper"></div>

	<div class="wpse-stuck-loading">
	<?php esc_html_e( 'The loading is taking too long?', 'vg_sheet_editor' ); ?>
	<br>
	<?php esc_html_e( '1. You can wait until the process finished.', 'vg_sheet_editor' ); ?>
	<br>
	<?php echo wp_kses_post( __( '2. You can <button type="button">cancel the process.</button>', 'vg_sheet_editor' ) ); ?>
</div>

	<?php
	if ( function_exists( 'WPSE_Profiler_Obj' ) ) {
		WPSE_Profiler_Obj()->record( 'After content ' . __FUNCTION__ );

	}
	?>
	<?php do_action( 'vg_sheet_editor/editor_page/after_content', $current_post_type ); ?>
</div>
	<?php
	if ( function_exists( 'WPSE_Profiler_Obj' ) ) {
		WPSE_Profiler_Obj()->record( 'After editor page ' . __FUNCTION__ );
	}
	?>
<?php do_action( 'vg_sheet_editor/editor_page/after_editor_page', $current_post_type ); ?>
<?php

if ( function_exists( 'WPSE_Profiler_Obj' ) ) {
	WPSE_Profiler_Obj()->finish( 'editor-page' );
}
if ( function_exists( 'WPSE_Profiler_Groups_Obj' ) ) {
	WPSE_Profiler_Groups_Obj()->finish( 0.01 );
}
