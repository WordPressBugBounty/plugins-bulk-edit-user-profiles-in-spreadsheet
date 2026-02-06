<?php defined( 'ABSPATH' ) || exit;
if ( ! is_admin() ) {
	return;
}
?>
<div class="extensions-list" id="extensions-list">
	<?php
	if ( ! VGSE()->helpers->is_editor_page() && empty( $_GET['vgse_only_inactive'] ) ) {
		?>

		<div class="extensions-group">
			<?php
			// Display all active extensions regardless of the bundle
			VGSE()->render_extensions_group(
				wp_list_filter(
					$extensions,
					array(
						'is_active' => true,
					)
				)
			);
			?>
		</div>
		<?php
	}

	foreach ( $bundles as $bundle_key => $bundle ) {

		if ( empty( $bundle['extensions'] ) ) {
			continue;
		}
		?>
		<h3><?php echo esc_html( $bundle['name'] ); ?></h3>
		<div class="alert alert-green" style="position: relative;">
		<?php
		if ( ! empty( $bundle['percentage_off'] ) && $bundle['percentage_off'] !== 'no' ) {
			// Translators: 1: Number percentage off
			printf( esc_html__( 'Promotion. %d%% OFF only today. ', 'vg_sheet_editor' ), (int) $bundle['percentage_off'] );
		}
			// Translators: 1: Number of extensions, 2: old price vs current price
			printf( esc_html__( 'Get the %1$d extensions below for just %2$s', 'vg_sheet_editor' ), count( $bundle['extensions'] ), '<strike>$ ' . esc_html( $bundle['old_price'] ) . '</strike> <b>$ ' . esc_html( $bundle['price'] ) . '</b>' );
		?>
			<?php
			if ( ! empty( $bundle['coupon'] ) ) {
				echo '<br>';
				// Translators: 1: coupon code
				printf( esc_html__( 'Use the coupon: %s', 'vg_sheet_editor' ), esc_html( $bundle['coupon'] ) );
			}
			?>
		</div>
		<p><b><?php esc_html_e( 'Money back guarantee.', 'vg_sheet_editor' ); ?></b> <?php esc_html_e( 'Buy the plugin without worries. We\'ll give you a refund if the plugin doesn\'t work.', 'vg_sheet_editor' ); ?></p>
		<div class="extensions-group highlighted">
			<?php VGSE()->render_extensions_group( $bundle['extensions'], $bundle ); ?>
		</div>
		<?php
	}
	?>

	<h3><?php esc_html_e( 'Other extensions', 'vg_sheet_editor' ); ?></h3><br/>
	<?php
	VGSE()->render_extensions_group(
		wp_list_filter(
			$extensions,
			array(
				'is_active' => false,
				'bundle'    => false,
			)
		)
	);
	?>
</div>
<script>

	jQuery(document).ready(function () {
		var $extensions = jQuery('.extensions-list > .wpb_wrapper');
		var maxHeight = 0;
		$extensions.each(function () {
			if (jQuery(this).height() > maxHeight) {
				maxHeight = jQuery(this).height();
			}
		});
		$extensions.height(maxHeight);
	});
</script>
