import React from 'react';
import { Container, Card } from 'react-bootstrap';


const TermsPage = () => {
  return (
    <Container className="my-5">
      <Card className="shadow">
        <Card.Header className="bg-dark text-white">
          <h1 className="text-center">Правила электронного ресурса</h1>
        </Card.Header>
        <Card.Body>
          <Card.Text className="lead">
            Настоящие правила составлены с учетом законодательства РФ "О рекламе" от 13.03.2006 N 38-ФЗ 
            и не являются рекламой алкогольной продукции. Электронный ресурс является сайтом Продавца 
            алкогольной продукции, имеющего розничный магазин. Сайт электронный ресурс создан для информирования 
            Клиентов об ассортименте Магазина и учета мнения Клиентов о Товаре с целью оптимизации ассортимента 
            или иных условий продаж в Магазине под спрос Клиентов, а также сбора статистической информации.
          </Card.Text>

          <section className="mt-4">
            <h3>Стороны настоящего Соглашения:</h3>
            <p>
              <strong>Клиент</strong> — юридическое лицо, имеющее намерение оформить и/или оформляющее Заявки, 
              представленные на сайте, и обладающее необходимым объемом дееспособности в 
              соответствии с законодательством РФ.
            </p>
            <p>
              <strong>Продавец</strong> — ООО «Пивовар» (ИНН: 3607005171, юридический адрес: 398001, город Липецк, пл. Победы, д. 8, офис 58 )
            </p>
          </section>

          <section className="mt-4">
            <h3>Термины:</h3>
            <p>
              <strong>Сайт</strong> — url сайта
            </p>
            <p>
              <strong>Заявка</strong> — должным образом оформленный запрос Клиента, содержащий пожелания Клиента 
              об ассортименте Товара и других свойствах Товара, который Клиент желал бы приобрести в Магазине 
              Продавца. Заявка служит для получения Клиентом информации о точной цене Товара и его наличия в 
              Магазине Продавца. Заявка не влечет возникновения обязательств, связанных с куплей-продажей Товара, 
              а носит информационный характер и учитывается Продавцом для оптимизации ассортимента Магазина.
            </p>
            <p>
              <strong>Акция</strong> — предложение Продавца о продаже товара определенного ассортимента в течение 
              определенного периода времени.
            </p>
          </section>

          <section className="mt-4">
            <h3>Общие положения</h3>
            <p>
              Представленная на сайте продукция (образцы продукции) предназначена для ознакомления с ассортиментом 
              и не является образцами товаров для совершения сделок купли-продажи дистанционным способом. 
              Направляя заявки через Cайт, Клиент соглашается с Правилами сайта (далее — Условия), 
              изложенными ниже. Настоящее соглашение, представленное на Сайте, является публичной офертой в 
              соответствии со ст. 435 и ч. 2 ст. 437 ГК РФ. Местом продажи Товаров является территория Магазина 
              Продавца. Продавец оставляет за собой право вносить изменения в настоящее Соглашение.
            </p>
          </section>

          <section className="mt-4">
            <h3>Оформление Заявки</h3>
            <p>
              Заявка Клиента оформляется самостоятельно Клиентом на Сайте. Для того чтобы иметь возможность 
              оформления Заявок на сайте, Клиент заполняет регистрационную форму и соглашается с условиями 
              настоящей оферты. Данные из регистрационной формы передаются Продавцу. Регистрация на Cайте 
              подразумевает обязательное согласие с публичной офертой Продавца, в противном случае Клиенту не 
              будет предоставлена возможность оформления Заявок. Продавец оставляет за собой право отказать 
              Клиенту в регистрации на Сайте без объяснения причин. Продавец имеет право аннулировать (удалить) 
              регистрацию пользователя без объяснения причин.
            </p>
          </section>

          <section className="mt-4">
            <h3>Сроки подтверждения Заявки</h3>
            <p>
              После оформления Заявки Клиент получает на указанный им электронный адрес информацию, в том числе 
              о точной стоимости Товара в Магазине, а также контактные данные Продавца. В течение 2-х дней с 
              момента получения Заявки представитель Продавца может связываться с Клиентом для получения 
              уточненной информации по Заявке. Также в случае получения заявки Покупателя, Продавец стремиться 
              обеспечить наличие указанного в заявке Товара в ассортименте Магазина.
            </p>
          </section>

          <section className="mt-4">
            <h3>Приобретение Товара и переход права собственности на Товар</h3>
            <p>
              Информация о цене Товара, количестве и ассортименте Товара, представленная на Сайте, размещена 
              для информирования Клиентов о возможности приобрести Товар у ООО “КОВЕН” и является приблизительной, 
              точная информация может быть получена после уточнения у менеджера самим Клиентом. Сделки по 
              приобретению Товара совершаются Клиентом лично.
            </p>
          </section>

          <section className="mt-4">
            <h3>Информация, предоставляемая Клиентом</h3>
            <p>
              При оформлении Заявки на Сайте Клиент предоставляет следующую информацию и соглашается на её 
              использование, обработку и хранение Продавцом: Фамилия, Имя, адрес электронной почты, контактный 
              телефон, адрес и другую информацию. Клиент, указывая на сайте при регистрации свои контактные данные, 
              понимает, что вносимые им данные не являются персональными данными, идентифицирующими Клиента на 
              основании п.1 ст.8 Федерального Закона от 27.07.2006 N 152-ФЗ в ред. Федерального закона от 
              25.07.2011 N 261-ФЗ, т.е. предоставляются Продавцу в обезличенной форме, добровольно, и в объеме, 
              необходимом и достаточном для исполнения Продавцом обязательств перед Клиентом. Продавец использует 
              предоставленную информацию для выполнения своих обязательств перед Клиентом в соответствии и на 
              основании Федерального Закона от 27.07.2006 N 152-ФЗ в ред. Федерального закона от 25.07.2011 N 
              261-ФЗ. Клиент соглашается на передачу Продавцом предоставленной информации агентам и третьим лицам, 
              действующим на основании договора с Продавцом, для исполнения перед Клиентом обязательств, возникающих 
              из настоящего соглашения и подаваемых через сайт заявок. Не считается нарушением обязательств 
              разглашение информации в соответствии с обоснованными и применимыми требованиями закона. Клиент 
              соглашается на передачу Продавцу своих данных в целях исполнения заключаемых договоров, в том числе 
              настоящего Соглашения, и принимаемых Продавцом в соответствии с ними обязательств по продаже Клиенту 
              Товара. Согласие Клиента выражается в указании им информации в соответствующих графах при оформлении 
              Заявки. Продавец не несет ответственности за сведения, предоставленные Клиентом на Сайте в 
              общедоступной форме.
            </p>
          </section>

          <section className="mt-4">
            <h3>Уведомления и информационные сообщения</h3>
            <p>
              При оформлении Заказа и/или регистрации на Сайте Клиент дает согласие на получение от Продавца 
              уведомлений (информационных сообщений). Указанные уведомления содержат информацию о предстоящих 
              акциях, розыгрышах и других мероприятиях Продавца. Настройка параметров и характеристик уведомлений 
              (периодичность получения, возможность отказа от получения уведомлений и пр.) размещена в разделе 
              «Личный кабинет», в пункте «Мои данные». Уведомления поступают в виде электронного письма на адрес 
              и/или короткого сообщения (sms) на номер телефона, указанный Клиентом при регистрации. Уведомления и 
              иные информационные материалы могут предоставляться в виде бумажно-полиграфической и сувенирной 
              продукции. На некоторые акции на сайте действует специальное условие – ограничение по минимальной 
              сумме Покупки.
            </p>
          </section>

          <div className="text-center mt-5">
            <p className="fst-italic">
              Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>
        </Card.Body>
        <Card.Footer className="text-center">
          <small>ООО "Пивовар" © {new Date().getFullYear()}</small>
        </Card.Footer>
      </Card>
    </Container>
    
  );
};

export default TermsPage;