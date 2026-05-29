export const MILENA_OPENAI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'remember_fact',
      description: 'Запомни факт/предпочитание за потребителя (постоянна памет)',
      parameters: {
        type: 'object',
        properties: { fact: { type: 'string' } },
        required: ['fact'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'save_project',
      description: 'Създай/обнови проект с бележки и прикачени файлове',
      parameters: {
        type: 'object',
        properties: {
          project_id: { type: 'string' },
          title: { type: 'string' },
          notes: { type: 'string' },
          attachment_urls: { type: 'array', items: { type: 'string' } },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_client',
      description: 'Добави CRM клиент',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
        },
        required: ['name', 'email'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'delete_client',
      description: 'Изтрий клиент (само админ)',
      parameters: {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'export_clients',
      description: 'Експорт CSV на клиенти (само админ)',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_client',
      description: 'Търси клиент по име',
      parameters: {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_contract',
      description: 'Генерира договор',
      parameters: {
        type: 'object',
        properties: {
          client_name: { type: 'string' },
          contract_type: { type: 'string', enum: ['preliminary', 'sale', 'rent', 'reservation'] },
        },
        required: ['client_name'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'schedule_appointment',
      description: 'Записва среща',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          time: { type: 'string' },
          client_name: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_property',
      description: 'Обновява обява в CRM (цена, заглавие, описание)',
      parameters: {
        type: 'object',
        properties: {
          property_id: { type: 'number' },
          price_eur: { type: 'number' },
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['property_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'delete_property',
      description: 'Изтрива обява',
      parameters: {
        type: 'object',
        properties: { property_id: { type: 'number' } },
        required: ['property_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'sync_marketplace_leads',
      description: 'Извлича обяви от Realistimo, Imoti.bg, OLX, Bazar, Home.bg и ги записва',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'generate_property_image',
      description: 'Генерира луксозна имотна снимка',
      parameters: {
        type: 'object',
        properties: { prompt: { type: 'string' } },
        required: ['prompt'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'convert_images_to_panoramas',
      description:
        'Превръща обикновени снимки в 2:1 equirectangular панорами за 3D оглед; опционално прегенерира тура за имот',
      parameters: {
        type: 'object',
        properties: {
          image_urls: { type: 'array', items: { type: 'string' } },
          property_id: { type: 'number', description: 'Ако е зададен — прегенерира виртуален тур' },
        },
        required: ['image_urls'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'improve_property_image',
      description: 'Подобрява снимка по URL',
      parameters: {
        type: 'object',
        properties: {
          image_url: { type: 'string' },
          instructions: { type: 'string' },
        },
        required: ['image_url'],
      },
    },
  },
]
