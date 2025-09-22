export enum responseErrorsUserMessages {
  USER_ALREADY_EXISTS = 'O usuário informado já existe.',
  USER_NOT_FOUND = 'O usuário não foi encontrado.',
  INCORRECT_PASSWORD = 'A senha informada está incorreta.',
  NOT_AUTHENTICATED = 'Usuário não autenticado.',
  ERROR_LOAD_USER_DATA = 'Ocorreu um erro ao carregar os dados do usuário, tente novamente.',
  ERROR_EMPTY_DATA_UPDATE = 'Nenhum informação fornecida para a atualização.',
  ERROR_UPDATE_USER = 'Ocorreu um erro ao atualizar as informações do usuário, tente novamente.',
  ERROR_DELETE_USER = 'Ocorreu um erro ao excluir essa conta, tente novamente.',
  INTERNAL_SERVER_ERROR = 'Ocorreu um erro interno no servidor, tente novamente.',
}
