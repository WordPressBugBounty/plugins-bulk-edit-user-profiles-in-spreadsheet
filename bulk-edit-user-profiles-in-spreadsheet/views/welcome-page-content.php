<?php

defined( 'ABSPATH' ) || exit;
$users_instance = vgse_users();
?>
<p><?php 
_e( 'Thank you for installing our plugin.', $users_instance->textname );
?></p>

<?php 
$steps = array();
$free_limit_note = sprintf( __( '<p>Note. You are using the free version and you can edit only users with "%s" role.</p>', $users_instance->textname ), esc_html( implode( ', ', array_values( VGSE_Users_Helpers_Obj()->get_available_user_roles() ) ) ) );
$steps['open_editor'] = '<p>' . sprintf( __( 'You can open the Users Bulk Editor Now:  <a href="%s" class="button">Click here</a>', $users_instance->textname ), VGSE()->helpers->get_editor_url( 'user' ) ) . '</p>' . $free_limit_note;
include VGSE_DIR . '/views/free-extensions-for-welcome.php';
$steps['free_extensions'] = $free_extensions_html;
$steps = apply_filters( 'vg_sheet_editor/users/welcome_steps', $steps );
if ( !empty( $steps ) ) {
    echo '<ol class="steps">';
    foreach ( $steps as $key => $step_content ) {
        if ( empty( $step_content ) ) {
            continue;
        }
        ?>
		<li><?php 
        echo wp_kses_post( $step_content );
        ?></li>		
		<?php 
    }
    echo '</ol>';
}