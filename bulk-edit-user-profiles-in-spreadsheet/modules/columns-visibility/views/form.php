<?php defined( 'ABSPATH' ) || exit; ?>

<div data-remodal-id="modal-columns-visibility" data-remodal-options="closeOnOutsideClick: false" class="remodal remodal<?php echo esc_attr( $random_id ); ?> modal-columns-visibility" x-data="vgseColumnsManager">

	<div class="modal-content">
		<?php if ( ! $partial_form ) { ?>
		<form action="<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>" method="POST" class="vgse-modal-form"
			data-nonce="<?php echo wp_create_nonce( 'bep-nonce' ); ?>" id="columns-manager-form" @submit.prevent="submitForm">
			<?php } ?>
			<h3><?php _e( 'Columns manager', 'vg_sheet_editor' ); ?></h3>
			<ul class="unstyled-list">
				<li>
					<p><?php _e( 'Drag the columns to the left or right side to enable/disable them, drag them to the top or bottom to sort them, click on the "edit" button to rename them, click on the "x" button to delete them completely (only when they are disabled previously).', 'vg_sheet_editor' ); ?><?php do_action( 'vg_sheet_editor/columns_visibility/after_instructions', $post_type, $visible_columns, $options[ $post_type ], $editor ); ?>
					</p>
				</li>
				<li>
					<div class="vgse-sorter-section">

						<h3><?php _e( 'Enabled', 'vg_sheet_editor' ); ?> <button @click.prevent="showBulkActions = !showBulkActions; bulkToggleClicked = 'enabled'" type="button"

								class="toggle-search-button"><i class="fa fa-edit"></i>
								<?php _e( 'Bulk', 'vg_sheet_editor' ); ?></button></h3>
								<template  x-if="showBulkActions">
						<div class="wpse-columns-bulk-actions" x-init="if(bulkToggleClicked == 'enabled') { $refs.enabledSearchInput.focus()}">
							<input x-model="enabledSearchTerm" x-ref="enabledSearchInput" type="search" class="wpse-filter-list"
								placeholder="<?php _e( 'Enter a search term...', 'vg_sheet_editor' ); ?>">
							<select class="wpse-bulk-action" x-model="enabledBulkAction" @change="handleBulkAction('enabled')">
								<option value=""><?php _e( 'Bulk actions', 'vg_sheet_editor' ); ?></option>
								<option value="disable"><?php _e( 'Disable all', 'vg_sheet_editor' ); ?></option>
								<option value="sort_alphabetically_asc">
									<?php _e( 'Sort alphabetically ASC', 'vg_sheet_editor' ); ?></option>
								<option value="sort_alphabetically_desc">
									<?php _e( 'Sort alphabetically DESC', 'vg_sheet_editor' ); ?></option>
							</select>
							<a href="#" data-wpse-tooltip="right"
								aria-label="<?php esc_attr_e( 'Select "Disable all" to disable all the columns from the list', 'vg_sheet_editor' ); ?>">(?)</a>
						</div>
						</template>


						<ul class="vgse-sorter columns-enabled" id="vgse-columns-enabled">
							<!-- Must use the key with random id to be able to use the sortable() function, otherwise Alpine will reuse DOM elements and lose track of the order -->
							<template x-for="column in getFilteredEnabledColumns()" :key="column.key + Date.now()">
								<li><span class="handle">::</span> <span class="column-title" :title="column.title"
										x-text="column.title"></span> 
										<template x-if="vgse_editor_settings && !vgse_editor_settings.columnsFormat[column.key]">
											<i class="fa fa-refresh" data-wpse-tooltip="right"
										aria-label="cm_requires_reload">&#xf021;</i>
										</template>
									<input type="hidden" name="columns[]" class="js-column-key" :value="column.key" />
									<input type="hidden" name="columns_names[]" class="js-column-title"
										:value="column.title" />

									<button class="deactivate-column column-action"
										title="<?php echo esc_attr( __( 'Disable column. You can enable it later.', 'vg_sheet_editor' ) ); ?>" @click.prevent="deactivateColumn(column.key)"><i
											class="fa fa-arrow-right"></i></button>
									<?php do_action( 'vg_sheet_editor/columns_visibility/enabled/after_column_action_alpine', $post_type ); ?>
									<div class="clear"></div>
								</li>
							</template>
						</ul>
					</div>
					<div class="vgse-sorter-section">
						<h3><?php _e( 'Disabled', 'vg_sheet_editor' ); ?> <button @click.prevent="showBulkActions = !showBulkActions; bulkToggleClicked = 'disabled'" type="button"
								class="toggle-search-button"><i class="fa fa-edit"></i>
								<?php _e( 'Bulk', 'vg_sheet_editor' ); ?></button></h3>

								<template  x-if="showBulkActions">
						<div class="wpse-columns-bulk-actions" x-init="if(bulkToggleClicked == 'disabled') { $refs.disabledSearchInput.focus() }">
							<input x-model="disabledSearchTerm" x-ref="disabledSearchInput" type="search" class="wpse-filter-list"
								placeholder="<?php _e( 'Enter a search term...', 'vg_sheet_editor' ); ?>">
							<select class="wpse-bulk-action" x-model="disabledBulkAction" @change="handleBulkAction('disabled')">
								<option value=""><?php _e( 'Bulk actions', 'vg_sheet_editor' ); ?></option>
								<option value="enable"><?php _e( 'Enable all', 'vg_sheet_editor' ); ?></option>
								<option value="delete"><?php _e( 'Hide all', 'vg_sheet_editor' ); ?></option>
								<option value="sort_alphabetically_asc">
									<?php _e( 'Sort alphabetically ASC', 'vg_sheet_editor' ); ?></option>
								<option value="sort_alphabetically_desc">
									<?php _e( 'Sort alphabetically DESC', 'vg_sheet_editor' ); ?></option>
							</select>
							<a href="#" data-wpse-tooltip="right"
								aria-label="<?php esc_attr_e( 'Select "Enable all" to enable all the columns from the list, "Hide all" to blacklist the columns and stop showing them', 'vg_sheet_editor' ); ?>">(?)</a>
						</div>
								</template>
						<ul class="vgse-sorter columns-disabled" id="vgse-columns-disabled">
							<template x-for="column in getFilteredDisabledColumns()" :key="column.key + Date.now()">
								<li>
									<span class="handle">::</span> <span class="column-title" :title="column.title"
										x-text="column.title"></span> 
										
										<template x-if="vgse_editor_settings && !vgse_editor_settings.columnsFormat[column.key]">
											<i class="fa fa-refresh" data-wpse-tooltip="right"
										aria-label="cm_requires_reload">&#xf021;</i>
										</template>
									<input type="hidden" name="disallowed_columns[]" class="js-column-key"
										:value="column.key" />
									<input type="hidden" name="disallowed_columns_names[]" class="js-column-title"
										:value="column.title" />

									<?php if ( VGSE()->helpers->user_can_manage_options() ) { ?>
									<button type="button" class="remove-column column-action"
										title="<?php echo esc_attr( __( 'The column values will remain in the database, this only excludes/hides the column from the list.', 'vg_sheet_editor' ) ); ?>" @click.prevent="deleteColumn(column.key)"><i
											class="fa fa-remove"></i></button>
									<?php } ?>
									<button class="enable-column column-action"
										title="<?php echo esc_attr( __( 'Enable column', 'vg_sheet_editor' ) ); ?>" @click.prevent="enableColumn(column.key)"><i
											class="fa fa-arrow-left"></i></button>
									<?php do_action( 'vg_sheet_editor/columns_visibility/disabled/after_column_action_alpine', $post_type ); ?>
									<div class="clear"></div>
								</li>
							</template>
						</ul>
					</div>
					<div class="clear"></div>
				</li>
				<?php if ( is_admin() && VGSE()->helpers->user_can_manage_options() ) { ?>
				<li class="missing-column-tips" x-data="{showMissingColumnTips: false}">
					<p><?php _e( 'A column is missing?', 'vg_sheet_editor' ); ?> <a href="#"
							@click.prevent="showMissingColumnTips = !showMissingColumnTips"><?php _e( 'Read more', 'vg_sheet_editor' ); ?></a>
				</p>

					<template x-if="showMissingColumnTips">
						<ul>
							<li><?php _e( '- First, edit one item in the normal editor and fill all the fields manually.', 'vg_sheet_editor' ); ?>
							</li>
							<?php
							if ( empty( $options[ $post_type ]['enabled'] ) ) {
								$options[ $post_type ]['enabled'] = array();
							}
							if ( empty( $options[ $post_type ]['disabled'] ) ) {
								$options[ $post_type ]['disabled'] = array();
							}
							?>
							<li><?php _e( '- We can scan the database, find new fields, and create columns automatically', 'vg_sheet_editor' ); ?>
								<a class="wpse-scan-db-link" href="
																																		<?php
																																		if ( wp_doing_ajax() ) {
																																			$rescan_url = add_query_arg( array( 'wpse_rescan_db_fields' => $post_type ), wp_get_referer() );
																																		} else {
																																			$rescan_url = ( $current_url ) ? add_query_arg( array( 'wpse_rescan_db_fields' => $post_type ), $current_url ) : add_query_arg( array( 'wpse_rescan_db_fields' => $post_type ) );
																																		}
																																		echo esc_url( $rescan_url );
																																		?>
											" data-wpse-tooltip="right"
									aria-label="<?php esc_attr_e( 'You can do this multiple times', 'vg_sheet_editor' ); ?>"><?php _e( 'Scan Now', 'vg_sheet_editor' ); ?></a>
							</li>

							<?php
							if ( class_exists( 'WP_Sheet_Editor_Custom_Columns' ) && VGSE()->helpers->is_editor_page() ) {
								?>
							<li><?php _e( '- If the previous solution failed, you can create new columns manually.', 'vg_sheet_editor' ); ?>
								<a class=""
									href="<?php echo esc_url( admin_url( 'admin.php?page=vg_sheet_editor_custom_columns' ) ); ?>"><?php _e( 'Create column', 'vg_sheet_editor' ); ?></a>
							</li>
							<?php } ?>
							<li><?php _e( '- Maybe you deleted the columns from the list.', 'vg_sheet_editor' ); ?> <a
									class="vgse-restore-removed-columns"
									href="#" @click.prevent="restoreDeletedColumns"><?php _e( 'Restore deleted columns', 'vg_sheet_editor' ); ?></a>
							</li>
							<li><?php _e( '- We can help you.', 'vg_sheet_editor' ); ?> <a class="" target="_blank"
									href="<?php echo esc_url( VGSE()->get_support_links( 'contact_us', 'url', 'sheet-missing-column' ) ); ?>"><?php _e( 'Contact us', 'vg_sheet_editor' ); ?></a>
							</li>
						</ul>
					</template>					
				</li>
				<?php } ?>
				<li class="vgse-allow-save-settings">
					<label><input type="checkbox" value="yes" x-model="saveChangesInServer" />
						<?php _e( 'Save these settings for future sessions?', 'vg_sheet_editor' ); ?> <a href="#"
							data-wpse-tooltip="right"
							aria-label="If you enable this option, we will use these settings the next time you load the editor for this post type.">(
							? )</a></label>

				</li>

				<?php do_action( 'vg_sheet_editor/columns_visibility/after_fields', $post_type ); ?>

				<li class="vgse-save-settings">
					<?php if ( ! $partial_form ) { ?>
					<button type="submit"
						class="remodal-confirm"><?php _e( 'Apply settings', 'vg_sheet_editor' ); ?></button>
					<button data-remodal-action="confirm"
						class="remodal-cancel"><?php _e( 'Close', 'vg_sheet_editor' ); ?></button>
					<?php } ?>
				</li>
			</ul>
			<input type="hidden" value="yes" name="vgse_columns_manager_form">
			<?php if ( ! $partial_form ) { ?>
			<input type="hidden" value="vgse_update_columns_visibility" name="action">
			<input type="hidden" value="<?php echo esc_attr( $nonce ); ?>" name="nonce">
			<input type="hidden" value="<?php echo esc_attr( $post_type ); ?>" name="post_type">
			<?php } ?>
			<input type="hidden" value="<?php echo esc_attr( $post_type ); ?>" name="wpsecv_post_type">
			<input type="hidden" value="<?php echo esc_attr( $nonce ); ?>" name="wpsecv_nonce">
			<input type="hidden" value="" name="wpse_auto_reload_after_saving">

			<?php if ( ! $partial_form ) { ?>
		</form>
		<?php } ?>
	</div>
	<br>
</div>
