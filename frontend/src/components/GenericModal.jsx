import Modal from 'react-modal';
// 1. Importa los estilos desde el módulo de CSS
import styles from './GenericModal.module.css';

function GenericModal({ isOpen, onRequestClose, children }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      // usamos 'className' para el contenido y 'overlayClassName' para el fondo.
      className={styles.content}
      overlayClassName={styles.overlay}
      contentLabel="Formulario Modal"
    >
      { /* Añadimos un botón de cierre */}
      <button onClick={onRequestClose} className={styles.closeButton}>
        &times;
      </button>
      {children}
    </Modal>
  );
}

export default GenericModal;