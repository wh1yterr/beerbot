import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const AgeVerificationModal = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Проверяем, было ли уже подтверждение
    const isVerified = localStorage.getItem('ageVerified');
    if (!isVerified) {
      setShow(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('ageVerified', 'true');
    setShow(false);
  };

  const handleDeny = () => {
    // Перенаправляем на сайт законодательства
    window.location.href = 'https://www.consultant.ru/document/cons_doc_LAW_8368/';
  };


  return (
    <Modal 
      show={show} 
      onHide={() => setShow(false)} 
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header className="bg-warning">
        <Modal.Title>Внимание</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center p-4">
          <h4>Добро пожаловать на сайт пивоварни ООО "Пивовар"</h4>
          <p className="mt-3">
            Приложение содержит информацию для лиц совершеннолетнего возраста. Сведения, размещенные здесь, 
            не являются рекламой и публичной офертой, носят исключительно информационный характер и 
            предназначены только для личного использования.
          </p>
          <p className="mt-3">
            Также большая часть контента доступна только юр. лицам с ЕГАИС после регистрации на данном сайте.
          </p>
          <p className="mt-3 fw-bold">
            Нажав на кнопку "Да", Вы подтверждаете, что являетесь юр. лицом (либо представляющим его интересы) 
            с ЕГАИС, а также достигли возраста 18 лет!
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button 
          variant="danger" 
          size="lg" 
          onClick={handleDeny}
          className="px-5"
        >
          Нет
        </Button>
        <Button
            variant="success"
            size='lg'
            onClick={handleConfirm}
            className='px-5'
        >
          Да
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AgeVerificationModal;