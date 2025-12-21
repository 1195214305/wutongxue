export interface Message {
  id: string;
  role: 'user' | 'mentor' | 'system';
  content: string;
  image?: string;
}

export const demoScenario: Message[] = [
  {
    id: '1',
    role: 'mentor',
    content: '你好！我是轩辕。听说你最近在用AI做开发，感觉怎么样？'
  },
  {
    id: '2',
    role: 'user',
    content: '挺快的，但是...怎么说呢，总觉得我做出来的网站有一股浓浓的“AI味儿”。'
  },
  {
    id: '3',
    role: 'mentor',
    content: '哈哈，是不是那种一眼就能看出来的“廉价感”？是不是用了大量的蓝紫渐变色？'
  },
  {
    id: '4',
    role: 'user',
    content: '对！就是那个！ClaudeCode特别爱用。还有那种圆角矩形卡片，满屏都是。'
  },
  {
    id: '5',
    role: 'mentor',
    content: '这就是问题所在。AI生成的UI往往缺乏创新，过度依赖emoji和标准化的圆角组件。要想打破这种“AI味”，最简单的方法不是自己瞎琢磨提示词。'
  },
  {
    id: '6',
    role: 'user',
    content: '那该怎么办？我也不懂设计啊。'
  },
  {
    id: '7',
    role: 'mentor',
    content: '直接“抄”作业。找那些高质量的、人类设计师打磨过的UI案例。我推荐你一个网站：aura.build。'
  },
  {
    id: '8',
    role: 'system',
    content: '系统提示：正在加载外部资源预览...'
  },
  {
    id: '9',
    role: 'mentor',
    content: '这个网站里全是漂亮的UI交互设计demo，而且最重要的是——它直接提供源代码。',
    image: 'https://mmbiz.qpic.cn/mmbiz_jpg/jXQDbLkGBYUiarnB5f1zL8nURkq4cZFX4h9NI1azXdYVsXlTn7EicUFtCAcbBsjWPibiaR5JsKI9wwgpIEj9ZHaJDw/640?wx_fmt=jpeg'
  },
  {
    id: '10',
    role: 'user',
    content: '直接给源码？那我岂不是可以直接复制给AI？'
  },
  {
    id: '11',
    role: 'mentor',
    content: 'Bingo！这就是秘诀。把这些高质量的源码喂给AI，让它“照猫画虎”，你的产品瞬间就从“AI demo”升级成“商业级产品”了。'
  },
  {
    id: '12',
    role: 'user',
    content: '太棒了，我这就去试试！那个网站叫什么来着？'
  },
  {
    id: '13',
    role: 'mentor',
    content: 'Aura.build。去吧，告别蓝紫渐变，做点真正“高大上”的东西。'
  }
];
