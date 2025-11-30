function Additional() {
  return (
    <div className="col-span-2 flex justify-center items-center py-10">

      <div className="card bg-base-100 border shadow-sm w-full max-w-xl">
        <div className="card-body space-y-4">
          <h2 className="card-title text-xl text-center">
            Tell me anything!
          </h2>

          <textarea
            className="textarea textarea-bordered w-full h-40"
            placeholder="Describe your lifestyle..."
          />
        </div>
      </div>

    </div>
  );
}

export default Additional;
