<?php
/**
 * Template used for notifying the user about the new features
 */
defined( 'ABSPATH' ) || exit;

$nonce = wp_create_nonce( 'bep-nonce' );
?>
<div class="remodal-bg quick-setup-page-content" id="vgse-wrapper">
	<div class="">
		<div class="">
			<h2 class="hidden"><?php esc_html_e( 'Sheet Editor', 'vg_sheet_editor' ); ?></h2>
			<img src="<?php echo esc_url( VGSE()->logo_url ); ?>" class="vg-logo"> 
		</div>
		<h2><?php esc_html_e( 'What\'s new on WP Sheet Editor', 'vg_sheet_editor' ); ?></h2>
		<div class="setup-screen whats-new-content">
			<p><?php esc_html_e( 'Thank you for updating to the new version of the plugin.', 'vg_sheet_editor' ); ?></p>

			<?php
			$version = VGSE()->version;
			if ( ! empty( $_GET['vgse_version'] ) && preg_match( '/\d/', $_GET['vgse_version'] ) ) {
				$version = preg_replace( '/[^\\d.]+/', '', sanitize_text_field( wp_unslash( $_GET['vgse_version'] ) ) );
			}

			$path = VGSE_DIR . '/views/whats-new/' . $version . '.php';
			if ( file_exists( $path ) ) {
				include_once $path;
			} else {
				$items = array();
			}
			$items = apply_filters( 'vg_sheet_editor/whats_new_page/items', $items );

			if ( ! empty( $items ) ) {
				echo '<ol class="steps">';
				foreach ( $items as $key => $step_content ) {
					?>
					<li><?php echo wp_kses_post( $step_content ); ?></li>		
					<?php
				}

				echo '</ol>';
			}
			?>
			<?php do_action( 'vg_sheet_editor/whats_new_page/quick_setup_screen/after_content' ); ?>

		</div>

		<div class="clear"></div>
		
		<?php do_action( 'vg_sheet_editor/whats_new_page/after_content' ); ?>
	</div>
</div>