import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/auth");
  };

  return (
    <div className="homepage-container">
      <h1>
        &quot;Only he who has the courage to enter the library of the god Thoth
        can discover true wisdom.&quot;
      </h1>
      <button onClick={() => (window.location.href = "/auth")}>
        Start the quiz
      </button>
    </div>
  );
}
