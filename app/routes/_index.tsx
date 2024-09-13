import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { demoComments, loadComments, getSubscribers } from "~/utils/ytfetch";
import { getFromGPT } from "~/utils/gpt";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// refactor this loader into a remix action
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const commentsString = formData.get('comments')?.toString() || '[]';

  console.log('Comments string:', commentsString);

  let comments = [];
  try {
    comments = JSON.parse(commentsString);
  } catch (error) {
    console.error('Error parsing comments:', error);
  }


  switch (actionType) {
    case "sendGPT": {
      return getFromGPT(JSON.stringify(comments));
    }
  }
  return null;
};


export const loader: LoaderFunction = async () => {
  // todo extract all this into its own file
  // return demoComments;
  const comments = await loadComments("https://www.youtube.com/watch?v=ip_EI4pvx1k");
  // console.log(getSubscribers('UCHL2iuxUaVUTareUBW2C1CA'));

  // return [];
  return comments;
};


export default function Index() {

  const comments = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const gpt = actionData?.gpt;


  return (
    <div className="font-sans p-4 bg-gray-900 text-white">
      <h1 className="text-3xl">Youtube Comments</h1>

      <Form method="post">
        <label htmlFor="videoUrl">Video URL:</label>
        <input type="url" id="videoUrl" name="videoUrl" className="block w-full p-2 mb-4 border-2 border-gray-300 rounded-md" />
        <button className="bg-white text-black rounded-full px-4 py-2" type="submit">Load Comments</button>
      </Form>

      <Form method="post">
        <input type="hidden" name="actionType" value="sendGPT" />
        <input type="hidden" name="comments" value={JSON.stringify(comments)} />
        <button className="bg-white text-black rounded-full px-4 py-2" type="submit">Send to GPT</button>
      </Form>
      {gpt && (
        <>
          <h1>Response</h1>
          {gpt.length > 0 ? (
            <ul>
              {gpt.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>Invalid Content Returned</p>
          )}
        </>
      )}

      {/* <ul>
        {messages.map((message, index) => (
          <li key={index}>
            <p>{message}</p><br />
          </li>
        ))}
      </ul> */}
    </div>
  );
}
