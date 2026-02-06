<?php  defined( 'ABSPATH' ) || exit; ?>
<h1><?php esc_html_e( 'WP Sheet Editor', 'vg_sheet_editor' ); ?></h1>
<p><?php esc_html_e( 'Do you want to install the premium plugin that you purchased? Follow these steps:', 'vg_sheet_editor' ); ?></p>
<ol>
	<li><?php esc_html_e( 'If you were using the free version of the plugin before the purchase, you need to uninstall the free version now', 'vg_sheet_editor' ); ?></li>
	<li><?php esc_html_e( 'When you purchased the plugin, you received an email with the download link and license key', 'vg_sheet_editor' ); ?></li>
	<li>
	<?php
	// translators: plugin install url
	printf( wp_kses_post( __( 'Now go to <a href="%1$s" target="_blank">this page</a> and click on the "Upload" button at the top', 'vg_sheet_editor' ), esc_url( admin_url( 'plugin-install.php' ) ) ) );
	?>
	</li>
	<li><?php esc_html_e( 'Upload the premium zip file', 'vg_sheet_editor' ); ?></li>
	<li><?php esc_html_e( 'Activate the plugin', 'vg_sheet_editor' ); ?></li>
	<li><?php esc_html_e( 'You will see a screen asking for a license, enter your license key', 'vg_sheet_editor' ); ?></li>
	<li><?php esc_html_e( 'Done. Now you should see the welcome page where you can set up the plugin and start using it', 'vg_sheet_editor' ); ?></li>
</ol>
<p>
<?php
// translators: 1: contact url
printf( wp_kses_post( __( 'If you need help, you can <a href="%1$s" target="_blank">contact us</a>', 'vg_sheet_editor' ), VGSE()->get_support_links( 'contact_us', 'url', 'license-page-error' ) ) );
?>
</p>
